import { useState, useEffect } from 'react';
import axios from 'axios';

function ManageVulns() {
  const [form, setForm] = useState(initialForm());
  const [vulns, setVulns] = useState([]);
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);

  function initialForm() {
    return {
      title: '',
      severity: 'Medium',
      cvss_score: '',
      cvss_vector: '',
      description: '',
      evidence: '',
      recommendation: '',
      reference: ''
    };
  }

  const fetchVulnerabilities = async () => {
    const res = await axios.get('http://127.0.0.1:8000/vulnerabilities/');
    setVulns(res.data);
  };

  useEffect(() => {
    fetchVulnerabilities();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await axios.put(`http://127.0.0.1:8000/vulnerabilities/${editingId}/`, form);
        alert('Vulnerability updated!');
      } else {
        await axios.post('http://127.0.0.1:8000/vulnerabilities/', form);
        alert('Vulnerability saved!');
      }
      setForm(initialForm());
      setEditingId(null);
      fetchVulnerabilities();
    } catch (err) {
      alert('Error saving!');
    }
  };

  const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete?")) return;

  try {
    await axios.delete(`http://127.0.0.1:8000/vulnerabilities/${id}`);
    setVulns(vulns.filter(v => v.id !== id));
  } catch (err) {
    console.error("Failed to delete:", err.response?.data || err.message);
    alert("Failed to delete vulnerability.");
  }
};


  const handleUpload = async () => {
    if (!file) return alert('Select a file first!');
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://127.0.0.1:8000/vulnerabilities/upload_excel/', formData);
      alert('Excel upload successful!');
      setFile(null);
      fetchVulnerabilities();
    } catch {
      alert('Excel upload failed!');
    }
  };

  const handleEdit = (vuln) => {
    setEditingId(vuln.id);
    setForm({
      title: vuln.title,
      severity: vuln.severity,
      cvss_score: vuln.cvss_score || '',
      cvss_vector: vuln.cvss_vector || '',
      description: vuln.description || '',
      evidence: vuln.evidence || '',
      recommendation: vuln.recommendation || '',
      reference: vuln.reference || ''
    });
  };

const deleteVulnerability = async (id) => {
  if (!window.confirm("Are you sure you want to delete this vulnerability?")) return;

  try {
    await axios.delete(`http://127.0.0.1:8000/vulnerabilities/${id}`);
    fetchVulnerabilities();  // Refresh list
  } catch (err) {
    console.error("Delete failed", err);
    alert("Failed to delete vulnerability");
  }
};


  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Form Section */}
      <div className="border p-6 rounded shadow">
        <h2 className="text-lg font-bold mb-4">{editingId ? "Edit Vulnerability" : "Add New Vulnerability"}</h2>

        <div className="grid grid-cols-2 gap-4">
          {['title', 'cvss_score', 'cvss_vector', 'description', 'evidence', 'recommendation', 'reference'].map((field) => (
            <div key={field} className="col-span-2">
              <label className="block font-semibold mb-1">{field.replace('_', ' ').toUpperCase()}</label>
              {['description', 'evidence', 'recommendation', 'reference'].includes(field) ? (
                <textarea
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
              ) : (
                <input
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
              )}
            </div>
          ))}

          <div className="col-span-2">
            <label className="block font-semibold mb-1">Severity</label>
            <select
              name="severity"
              value={form.severity}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-6 py-2 rounded mt-4"
        >
          {editingId ? "Update Vulnerability" : "Save Vulnerability"}
        </button>
      </div>

      {/* Excel Upload */}
<div className="border p-6 rounded shadow">
  <h2 className="text-lg font-bold mb-4">Upload Vulnerabilities via Excel</h2>

  <div className="flex flex-wrap items-center gap-4">
    <label className="block">
      <input
        type="file"
        accept=".xlsx"
        onChange={(e) => setFile(e.target.files[0])}
        className="border px-3 py-2 rounded"
      />
    </label>

    <button
      onClick={handleUpload}
      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
    >
      Upload
    </button>

    <a
      href="http://127.0.0.1:8000/vulnerabilities/sample_excel/"
      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
      download
    >
      Download Sample Excel
    </a>
  </div>
</div>

      {/* Existing Vulnerabilities */}
      <div className="border p-6 rounded shadow">
        <h2 className="text-lg font-bold mb-4">Saved Vulnerabilities</h2>
        <ul className="space-y-2">
          {vulns.map((v) => (
            <li key={v.id} className="border p-4 rounded flex justify-between items-center bg-gray-50">
              <div>
                <div className="font-semibold">{v.title}</div>
                <div className="text-sm text-gray-600">Severity: {v.severity}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(v)} className="text-blue-600">Edit</button>
                <button onClick={() => handleDelete(v.id)} className="text-red-600">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ManageVulns;
