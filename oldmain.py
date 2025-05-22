import sys
import json

import app
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QTabWidget,
    QPushButton, QFileDialog, QHBoxLayout
)
from config import load_config
from db import init_db
from project_info_tab import ProjectInfoTab
from vulnerability_tab import VulnerabilityTab
from summary_tab import SummaryTab
from generate_tab import GenerateTab
from manage_vuln_tab import ManageVulnTab
from fastapi import FastAPI
from webapp.routers import evidences
from webapp.routers import vulnerabilities, report, logo
from fastapi.middleware.cors import CORSMiddleware
from routers import report
app.include_router(report.router)

app = FastAPI()
app.include_router(vulnerabilities.router)
app.include_router(report.router)
app.include_router(logo.router)
app.include_router(evidences.router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("DVAReporter")
        self.setGeometry(100, 100, 1000, 600)

        # Ensure DB and default logo are ready
        init_db()
        self.config = load_config()

        # Tabs
        self.tabs = QTabWidget()
        self.project_info_tab = ProjectInfoTab()
        self.vulnerability_tab = VulnerabilityTab()
        self.manage_vuln_tab = ManageVulnTab(self)
        self.summary_tab = SummaryTab()
        self.generate_tab = GenerateTab(
            self.project_info_tab,
            self.summary_tab,
            self.config["logo_path"]
        )

        self.tabs.addTab(self.project_info_tab, "Project Info")
        self.tabs.addTab(self.vulnerability_tab, "Vulnerabilities")
        self.tabs.addTab(self.summary_tab, "Summary")
        self.tabs.addTab(self.manage_vuln_tab, "Manage Vulnerabilities")
        self.tabs.addTab(self.generate_tab, "Generate")

        self.tabs.currentChanged.connect(self.refresh_summary_tab)

        container = QWidget()
        layout = QVBoxLayout()
        layout.addWidget(self.tabs)

        # Save/Load buttons
        button_layout = QHBoxLayout()
        self.save_button = QPushButton("Save Project (JSON)")
        self.load_button = QPushButton("Load Project (JSON)")
        self.save_button.clicked.connect(self.save_project)
        self.load_button.clicked.connect(self.load_project)
        button_layout.addWidget(self.save_button)
        button_layout.addWidget(self.load_button)

        layout.addLayout(button_layout)
        container.setLayout(layout)
        self.setCentralWidget(container)

    def save_project(self):
        file_path, _ = QFileDialog.getSaveFileName(self, "Save Project", "", "JSON Files (*.json)")
        if file_path:
            data = {
                "project_info": self.project_info_tab.get_data(),
                "selected_vulnerabilities": self.vulnerability_tab.get_data(),
                "summary": self.summary_tab.get_summary_data()
            }
            with open(file_path, 'w') as f:
                json.dump(data, f, indent=4)

    def load_project(self):
        file_path, _ = QFileDialog.getOpenFileName(self, "Load Project", "", "JSON Files (*.json)")
        if file_path:
            with open(file_path, 'r') as f:
                data = json.load(f)
                self.project_info_tab.set_data(data.get("project_info", {}))
                self.vulnerability_tab.set_data(data.get("selected_vulnerabilities", []))
                self.summary_tab.set_summary_data(data.get("summary", []))

    def refresh_summary_tab(self, index):
        if self.tabs.tabText(index) == "Summary":
            selected_vulns = self.vulnerability_tab.get_data()
            self.summary_tab.update_summary(selected_vulns)

    def load_vulnerabilities(self):
        self.vulnerability_tab.refresh_vulnerabilities()


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())
