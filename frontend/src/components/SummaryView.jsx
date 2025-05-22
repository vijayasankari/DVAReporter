import React, { useState } from 'react';

const SummaryView = ({ selectedVulnerabilities = [], evidenceData = {} }) => {
  const [activeId, setActiveId] = useState(null);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-700">Summary of Findings</h2>
      {selectedVulnerabilities.map((vuln) => (
        <div key={vuln.instanceId} className="border rounded p-4">
          <button
            className="text-left w-full font-semibold text-blue-700 text-lg"
            onClick={() => setActiveId(activeId === vuln.instanceId ? null : vuln.instanceId)}
          >
            {vuln.title}
          </button>

          {activeId === vuln.instanceId && (
            <div className="mt-2 space-y-2 text-sm text-gray-700">
              <p><strong>Severity:</strong> {vuln.severity}</p>
              <p><strong>CVSS Score:</strong> {vuln.cvss_score}</p>
              <p><strong>Description:</strong> {vuln.description}</p>
              <p><strong>Recommendation:</strong> {vuln.recommendation}</p>
              <p><strong>Reference:</strong> {vuln.reference}</p>

              <div className="mt-4">
                <h4 className="font-semibold text-md">Evidences:</h4>
                {evidenceData[vuln.instanceId]?.length > 0 ? (
                  evidenceData[vuln.instanceId].map((step, idx) => (
                    <div key={idx} className="border p-2 mt-2 rounded bg-gray-50">
                      <strong>Step {idx + 1}</strong>
                      <p>{step.comment}</p>
                      {step.screenshotPath && (
                        <img
                          src={`http://127.0.0.1:8000${step.screenshotPath}`}
                          alt={`Step ${idx + 1}`}
                          className="mt-1 max-w-xs border rounded"
                        />
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
