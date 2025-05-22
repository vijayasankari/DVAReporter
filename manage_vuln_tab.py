from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QLabel, QLineEdit, QTextEdit, QPushButton,
    QComboBox, QHBoxLayout, QListWidget, QListWidgetItem, QMessageBox
)
from db import get_all_vulnerabilities, get_full_vulnerability, DB_PATH
import sqlite3


class ManageVulnTab(QWidget):
    def __init__(self, parent):
        super().__init__()
        self.parent = parent
        self.layout = QVBoxLayout()

        self.title_input = QLineEdit()
        self.severity_input = QComboBox()
        self.severity_input.addItems(["Low", "Medium", "High", "Critical"])
        self.cvss_score_input = QLineEdit()
        self.cvss_vector_input = QLineEdit()
        self.description_input = QTextEdit()
        self.evidence_input = QTextEdit()
        self.recommendation_input = QTextEdit()
        self.reference_input = QTextEdit()

        self.save_button = QPushButton("Add / Update Vulnerability")
        self.save_button.clicked.connect(self.save_vulnerability)

        self.vuln_list = QListWidget()
        self.vuln_list.itemClicked.connect(self.load_vulnerability_data)

        self.delete_button = QPushButton("Delete Selected Vulnerability")
        self.delete_button.clicked.connect(self.delete_vulnerability)

        # Form layout
        self.layout.addWidget(QLabel("Title:"))
        self.layout.addWidget(self.title_input)
        self.layout.addWidget(QLabel("Severity:"))
        self.layout.addWidget(self.severity_input)
        self.layout.addWidget(QLabel("CVSS Score:"))
        self.layout.addWidget(self.cvss_score_input)
        self.layout.addWidget(QLabel("CVSS Vector:"))
        self.layout.addWidget(self.cvss_vector_input)
        self.layout.addWidget(QLabel("Description:"))
        self.layout.addWidget(self.description_input)
        self.layout.addWidget(QLabel("Evidence:"))
        self.layout.addWidget(self.evidence_input)
        self.layout.addWidget(QLabel("Recommendation:"))
        self.layout.addWidget(self.recommendation_input)
        self.layout.addWidget(QLabel("Reference:"))
        self.layout.addWidget(self.reference_input)
        self.layout.addWidget(self.save_button)
        self.layout.addWidget(QLabel("Existing Vulnerabilities:"))
        self.layout.addWidget(self.vuln_list)
        self.layout.addWidget(self.delete_button)

        self.setLayout(self.layout)
        self.refresh_vuln_list()

    def refresh_vuln_list(self):
        self.vuln_list.clear()
        vulns = get_all_vulnerabilities()
        for v in vulns:
            item = QListWidgetItem(f"[{v['severity']}] {v['title']}")
            item.setData(1000, v["title"])
            self.vuln_list.addItem(item)

    def load_vulnerability_data(self, item):
        title = item.data(1000)
        vuln = get_full_vulnerability(title)
        if vuln:
            self.title_input.setText(vuln["title"])
            self.severity_input.setCurrentText(vuln["severity"])
            self.cvss_score_input.setText(vuln["cvss_score"])
            self.cvss_vector_input.setText(vuln["cvss_vector"])
            self.description_input.setPlainText(vuln["description"])
            self.evidence_input.setText(vuln["evidence"])
            self.recommendation_input.setPlainText(vuln["recommendation"])
            self.reference_input.setPlainText(vuln["reference"])

    def save_vulnerability(self):
        title = self.title_input.text().strip()
        severity = self.severity_input.currentText()
        cvss_score = self.cvss_score_input.text().strip()
        cvss_vector = self.cvss_vector_input.text().strip()
        description = self.description_input.toPlainText().strip()
        evidence = self.evidence_input.toPlainText().strip()
        recommendation = self.recommendation_input.toPlainText().strip()
        reference = self.reference_input.toPlainText().strip()

        if not title:
            QMessageBox.warning(self, "Error", "Title cannot be empty.")
            return

        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("""
                    INSERT INTO vulnerabilities (title, severity, cvss_score, cvss_vector, description, evidence,
                                                 recommendation, reference)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(title) DO
                    UPDATE SET
                        severity=excluded.severity,
                        cvss_score=excluded.cvss_score,
                        cvss_vector=excluded.cvss_vector,
                        description=excluded.description,
                        evidence=excluded.evidence,
                        recommendation=excluded.recommendation,
                        reference=excluded.reference
                    """, (title, severity, cvss_score, cvss_vector, description, evidence, recommendation, reference))

        conn.commit()
        conn.close()

        QMessageBox.information(self, "Saved", "Vulnerability saved successfully.")
        self.refresh_vuln_list()

        if self.parent:
            self.parent.load_vulnerabilities()

    def delete_vulnerability(self):
        selected_item = self.vuln_list.currentItem()
        if not selected_item:
            QMessageBox.warning(self, "Error", "Please select a vulnerability to delete.")
            return

        title = selected_item.data(1000)
        confirm = QMessageBox.question(self, "Confirm Delete", f"Are you sure you want to delete '{title}'?",
                                        QMessageBox.Yes | QMessageBox.No)
        if confirm == QMessageBox.Yes:
            try:
                conn = sqlite3.connect(DB_PATH)
                cur = conn.cursor()
                cur.execute("DELETE FROM vulnerabilities WHERE title = ?", (title,))
                conn.commit()
                conn.close()

                QMessageBox.information(self, "Deleted", f"'{title}' deleted successfully.")
                self.refresh_vuln_list()
                if self.parent:
                    self.parent.load_vulnerabilities()
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Failed to delete vulnerability: {e}")