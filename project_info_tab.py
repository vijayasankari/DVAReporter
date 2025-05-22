from PyQt5.QtWidgets import QWidget, QVBoxLayout, QLabel, QLineEdit, QTextEdit


class ProjectInfoTab(QWidget):
    def __init__(self):
        super().__init__()
        layout = QVBoxLayout()

        self.project_title = QLineEdit()
        self.analyst_name = QLineEdit()
        self.scope_text = QTextEdit()

        layout.addWidget(QLabel("Project Title:"))
        layout.addWidget(self.project_title)
        layout.addWidget(QLabel("Analyst Name:"))
        layout.addWidget(self.analyst_name)
        layout.addWidget(QLabel("Scope:"))
        layout.addWidget(self.scope_text)

        self.setLayout(layout)

    def get_data(self):
        return {
            "project_title": self.project_title.text(),
            "analyst_name": self.analyst_name.text(),
            "scope": self.scope_text.toPlainText()
        }

    def set_data(self, data):
        self.project_title.setText(data.get("project_title", ""))
        self.analyst_name.setText(data.get("analyst_name", ""))
        self.scope_text.setPlainText(data.get("scope", ""))
