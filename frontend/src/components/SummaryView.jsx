import React, { useState } from 'react';

const SummaryView = ({ selectedVulnerabilities = [], evidenceData = {} }) => {
  const [activeIds, setActiveIds] = useState([]);

  const toggleId = (id) => {
    setActiveIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const expandAll = () => setActiveIds(selectedVulnerabilities.map(v => v.instanceId));
  const collapseAll = () => setActiveIds([]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-gray-700">Summary of Findings</h2>
        <div className="space-x-2">
          <button onClick={expandAll} className="text-sm px-3 py-1 bg-blue-600 text-white rounded">Expand All</button>
          <button onClick={collapseAll} className="text-sm px-3 py-1 bg-gray-300 rounded">Collapse All</button>
        </div>
      </div>

      {selectedVulnerabilities.map((vuln) => (
        <div key={vuln.instanceId} className="border rounded p-4 shadow-sm bg-white">
          <button
            className="text-left w-full font-semibold text-blue-700 text-lg hover:underline"
            onClick={() => toggleId(vuln.instanceId)}
          >
            {vuln.title}
          </button>

          {activeIds.includes(vuln.instanceId) && (
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <p><strong>Severity:</strong> {vuln.severity || 'N/A'}</p>
              <p><strong>CVSS Score:</strong> {vuln.cvss_score || 'N/A'}</p>
              <p><strong>Description:</strong> {vuln.description || 'N/A'}</p>
              <p><strong>Recommendation:</strong> {vuln.recommendation || 'N/A'}</p>
              <p><strong>Reference:</strong> {vuln.reference || 'N/A'}</p>

              <div className="mt-4">
                <h4 className="font-semibold text-md">Evidences:</h4>
                {evidenceData[vuln.instanceId]?.length > 0 ? (
                  evidenceData[vuln.instanceId].map((step, idx) => (
                    <div key={idx} className="border p-2 mt-2 rounded bg-gray-50">
                      <p className="font-semibold mb-1">Step {idx + 1}</p>
                      {step.comment && <p className="mb-2">{step.comment}</p>}

                      {step.screenshotPath && (
                        <div className="flex flex-wrap gap-3">
                          {(Array.isArray(step.screenshotPath)
                            ? step.screenshotPath
                            : [step.screenshotPath]
                          ).map((path, i) => (
                            <img
                              key={i}
                              src={`http://127.0.0.1:8000${path}`}
                              alt={`Step ${idx + 1} - Image ${i + 1}`}
                              className="max-w-xs border rounded"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No evidences added.</p>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SummaryView;
