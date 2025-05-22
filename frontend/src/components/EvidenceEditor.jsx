import React, { useRef, useState, useEffect } from 'react';

const EvidenceEditor = ({
  selectedVulnerabilities = [],
  evidenceMap = {},
  onUpdateEvidence
}) => {
  const getDefaultId = (v) => v.instanceId || String(v.id);
  const [activeVulnId, setActiveVulnId] = useState(
    selectedVulnerabilities.length > 0 ? getDefaultId(selectedVulnerabilities[0]) : ''
  );

  useEffect(() => {
    if (selectedVulnerabilities.length > 0) {
      const firstId = getDefaultId(selectedVulnerabilities[0]);
      setActiveVulnId((prev) =>
        selectedVulnerabilities.some((v) => getDefaultId(v) === prev) ? prev : firstId
      );
    }
  }, [selectedVulnerabilities]);

  const fileInputRef = useRef(null);
  const activeSteps = evidenceMap[activeVulnId] || [];

  const handleCommentChange = (index, value) => {
    const updated = [...activeSteps];
    updated[index].comment = value;
    onUpdateEvidence(activeVulnId, updated);
  };

  const handleImageChange = async (index, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://127.0.0.1:8000/evidences/upload/', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const updated = [...activeSteps];
      updated[index].screenshotPath = data.file_path;
      onUpdateEvidence(activeVulnId, updated);
    } catch (err) {
      console.error(err);
      alert('Image upload failed');
    }
  };

  const handleAddStep = () => {
    const currentSteps = evidenceMap[activeVulnId] || [];
    const updated = [...currentSteps, { comment: '', screenshotPath: '' }];
    onUpdateEvidence(activeVulnId, updated);
  };

  const handleRemoveStep = (index) => {
    const updated = [...activeSteps];
    updated.splice(index, 1);
    onUpdateEvidence(activeVulnId, updated);
  };

  return (
    <div className="flex gap-6">
      {/* Left: Vulnerability List */}
      <div className="w-1/4 border-r pr-4">
        <h3 className="font-semibold mb-2">Selected Vulnerabilities</h3>
        <ul className="space-y-2">
          {selectedVulnerabilities.map((vuln) => {
            const vid = getDefaultId(vuln);
            return (
              <li
                key={vid}
                onClick={() => setActiveVulnId(vid)}
                className={`cursor-pointer px-3 py-2 rounded border ${
                  activeVulnId === vid ? 'bg-blue-100 font-bold' : 'hover:bg-gray-100'
                }`}
              >
                {vuln.title}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Right: Evidence Panel */}
      <div className="w-3/4">
        <h3 className="text-lg font-semibold mb-2">
          Evidence for: {selectedVulnerabilities.find(v => getDefaultId(v) === activeVulnId)?.title || ''}
        </h3>

        {activeSteps.map((step, idx) => (
          <div key={idx} className="border rounded p-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="font-bold">Step {idx + 1}</span>
              <div className="space-x-2">
                <label>
                  <input
                    type="file"
                    hidden
                    ref={fileInputRef}
                    onChange={(e) => handleImageChange(idx, e.target.files[0])}
                    accept="image/*"
                  />
                  <button
                    className="px-2 py-1 border rounded text-xs"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Add Image
                  </button>
                </label>
                <button onClick={() => handleRemoveStep(idx)} className="text-red-500 text-xl font-bold">−</button>
              </div>
            </div>

            <textarea
              className="w-full mt-2 border p-2 rounded resize-y"
              rows={3}
              placeholder="Enter comment..."
              value={step.comment}
              onChange={(e) => handleCommentChange(idx, e.target.value)}
            />

            {step.screenshotPath && (
              <img
                src={`http://127.0.0.1:8000${step.screenshotPath}`}
                alt={`Step ${idx + 1}`}
                className="mt-2 max-w-xs border rounded"
              />
            )}
          </div>
        ))}

        <button
          onClick={handleAddStep}
          className="px-3 py-1 bg-green-600 text-white rounded text-sm mt-2"
        >
          + Add Step
        </button>
      </div>
    </div>
  );
};

export default EvidenceEditor;
