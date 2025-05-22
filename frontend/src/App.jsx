// src/App.jsx

import { useState } from 'react';
import ProjectInfo from './components/ProjectInfo';
import VulnerabilityPicker from './components/VulnerabilityPicker';
import ManageVulns from './components/ManageVulns';
import EvidenceEditor from './components/EvidenceEditor';
import SummaryView from './components/SummaryView';
import ReportForm from './components/ReportForm';

function App() {
  const [tab, setTab] = useState('project');
  const [projectInfo, setProjectInfo] = useState({
    title: '',
    scope: '',
    urls: '',
    analyst: '',
    requester: ''
  });
  const [selectedVulns, setSelectedVulns] = useState([]);
  const [evidenceMap, setEvidenceMap] = useState({});

  const tabs = [
    { id: 'project', label: 'Project Info' },
    { id: 'picker', label: 'Vulnerability Picker' },
    { id: 'manage', label: 'Manage Vulnerabilities' },
    { id: 'evidence', label: 'Evidences' },
    { id: 'summary', label: 'Summary' },
    { id: 'generate', label: 'Generate Report' }
  ];

  return (
    <div className="min-h-screen bg-white p-4">
      <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">
        DVAReporter - Web
      </h1>

      <div className="flex justify-center gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded ${
              tab === t.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-6xl mx-auto">
        {tab === 'project' && (
          <ProjectInfo value={projectInfo} onChange={setProjectInfo} />
        )}

        {tab === 'picker' && (
          <VulnerabilityPicker
            selected={selectedVulns}
            setSelected={setSelectedVulns}
          />
        )}

        {tab === 'manage' && <ManageVulns />}

        {tab === 'evidence' && (
          <EvidenceEditor
            selectedVulnerabilities={selectedVulns}
            evidenceMap={evidenceMap}
            onUpdateEvidence={(instanceId, updatedSteps) =>
              setEvidenceMap((prev) => ({
                ...prev,
                [instanceId]: updatedSteps
              }))
            }
          />
        )}

        {tab === 'summary' && (
          <SummaryView
            selectedVulnerabilities={selectedVulns}
            evidenceData={evidenceMap}
          />
        )}

        {tab === 'generate' && (
          <ReportForm
            selected={selectedVulns}
            evidenceMap={evidenceMap}
            projectInfo={projectInfo}
          />
        )}
      </div>
    </div>
  );
}

export default App;
