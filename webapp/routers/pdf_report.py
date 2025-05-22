from fastapi import APIRouter
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os, uuid, pdfkit

router = APIRouter(prefix="/report", tags=["PDF Report"])

class PDFReportRequest(BaseModel):
    app_title: str
    scope: str
    urls: str
    analyst_name: str
    requester_name: str
    vulnerabilities: list
    evidence_data: dict

@router.post("/pdf", response_class=FileResponse)
def generate_pdf_report(payload: PDFReportRequest):
    html = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; }}
            h1 {{ color: #0a4a82; }}
            .vuln {{ margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; }}
        </style>
    </head>
    <body>
        <h1>Dynamic Vulnerability Assessment</h1>
        <p><strong>Application:</strong> {payload.app_title}</p>
        <p><strong>Requested By:</strong> {payload.requester_name}</p>
        <p><strong>Analyst:</strong> {payload.analyst_name}</p>
        <p><strong>Scope:</strong> {payload.scope}</p>
        <p><strong>URLs:</strong> {payload.urls}</p>
        <hr />
    """

    for idx, vuln in enumerate(payload.vulnerabilities, 1):
        evidence_blocks = payload.evidence_data.get(str(vuln.get("instanceId") or vuln.get("id")), {}).get("blocks", [])
        html += f"<div class='vuln'><h2>{idx}. {vuln['title']}</h2>"
        html += f"<p><strong>Severity:</strong> {vuln['severity']}</p>"
        html += f"<p><strong>CVSS Score:</strong> {vuln['cvss_score']}</p>"
        html += f"<p><strong>Description:</strong> {vuln['description']}</p>"

        if evidence_blocks:
            html += "<p><strong>Evidence:</strong><ul>"
            for block in evidence_blocks:
                if block.get("type") == "text":
                    html += f"<li>{block.get('content')}</li>"
            html += "</ul></p>"

        html += f"<p><strong>Recommendation:</strong> {vuln['recommendation']}</p>"
        html += f"<p><strong>Reference:</strong> {vuln['reference']}</p></div>"

    html += "</body></html>"

    filename = f"report_{uuid.uuid4().hex}.pdf"
    filepath = os.path.join("webapp", filename)
    pdfkit.from_string(html, filepath)
    return FileResponse(filepath, filename="DVA_Report.pdf", media_type="application/pdf")
