from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QLabel, QTableWidget,
    QTableWidgetItem, QHeaderView
)


class SummaryTab(QWidget):
    def __init__(self):
        super().__init__()
        self.vulns = []
        self.layout = QVBoxLayout()
        self.title = QLabel("Summary of Selected Vulnerabilities")
        self.table = QTableWidget()

        self.layout.addWidget(self.title)
        self.layout.addWidget(self.table)
        self.setLayout(self.layout)

    def update_summary(self, selected_vulns):
        self.vulns = selected_vulns

        self.table.clear()
        self.table.setRowCount(len(self.vulns))
        self.table.setColumnCount(4)
        self.table.setHorizontalHeaderLabels(["Sl. No.", "Vulnerability", "Severity", "Page No."])

        for i, vuln in enumerate(self.vulns):
            self.table.setItem(i, 0, QTableWidgetItem(str(i + 1)))
            self.table.setItem(i, 1, QTableWidgetItem(vuln["title"]))
            self.table.setItem(i, 2, QTableWidgetItem(vuln["severity"]))
            self.table.setItem(i, 3, QTableWidgetItem(""))  # Editable page number

        self.table.horizontalHeader().setStretchLastSection(True)
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)

    def get_summary_data(self):
        summary = []
        for row in range(self.table.rowCount()):
            summary.append({
                "title": self.table.item(row, 1).text(),
                "severity": self.table.item(row, 2).text(),
                "page": self.table.item(row, 3).text()
            })
        return summary

    def set_summary_data(self, summary_data):
        self.update_summary(summary_data)
        for row, item in enumerate(summary_data):
            self.table.setItem(row, 3, QTableWidgetItem(item.get("page", "")))
