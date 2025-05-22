import { useState } from 'react';
import axios from 'axios';

function ReportForm({ selected, evidenceMap, projectInfo }) {
  const [loading, setLoading] = useState(false);

  const sanitizeEvidence = (map) => {
    const clean = {};
    for (const k in map) {
      clean[k] = map[k].map(s => ({
        comment: s.comment,
        screenshotPath: s.screenshotPath?.startsWith('/') ? s.screenshotPath : ''
      }));
    }
    return clean;
  };

  const handleSubmit = async () => {
    if (!projectInfo.title || !projectInfo.scope || !projectInfo.urls || !projectInfo.analyst || !projectInfo.requester) {
      return alert("Fill all Project Info fields.");
    }
    if (!selected.length) {
      return alert("Select at least one vulnerability.");
    }

    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/report/", {
        app_title: projectInfo.title,
        scope: projectInfo.scope,
        urls: projectInfo.urls,
        analyst_name: projectInfo.analyst,
        requester_name: projectInfo.requester,
        vulnerabilities: selected,
        evidence_data: sanitizeEvidence(evidenceMap)
      }, { responseType: 'blob' });

      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${projectInfo.title || 'DVA'}_ManualReport.docx`;
      link.click();
    } catch (err) {
      alert("Report generation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto border p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Generate DVA Report</h2>
      <button onClick={handleSubmit} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
        {loading ? "Generating..." : "Generate Report"}
      </button>
    </div>
  );
}

export default ReportForm;
