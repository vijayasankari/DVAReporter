// src/App.jsx
import { useState } from 'react';
import ProjectInfo from './components/ProjectInfo';
import VulnerabilityPicker from './components/VulnerabilityPicker';
import ManageVulns from './components/ManageVulns';
import EvidenceEditor from './components/EvidenceEditor';
import SummaryView from './components/SummaryView';
import ReportForm from './components/ReportForm';
import LoginPage from './components/LoginPage';
import OktaLogin from './components/OktaLogin';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [useOkta, setUseOkta] = useState(false);
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

  const handleLogin = (jwt) => {
    localStorage.setItem("token", jwt);
    setToken(jwt);
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setTab('project');
    setProjectInfo({
      title: '',
      scope: '',
      urls: '',
      analyst: '',
      requester: ''
    });
    setSelectedVulns([]);
    setEvidenceMap({});
  };

  if (!token) {
    return (
      <>
        {useOkta ? (
          <OktaLogin onLogin={handleLogin} />
        ) : (
          <LoginPage onLogin={handleLogin} />
        )}
        <div className="text-center mt-4">
          <button
            onClick={() => setUseOkta(!useOkta)}
            className="text-blue-600 underline text-sm"
          >
            {useOkta ? "Use Local Login" : "Use Okta Login"}
          </button>
        </div>
        <ToastContainer position="top-center" autoClose={3000} />
      </>
    );
  }

  const tabs = [
    { id: 'project', label: 'Project Info' },
    { id: 'vulnerabilities', label: 'Vulnerability Picker' },
    { id: 'manage', label: 'Manage Vulnerabilities' },
    { id: 'evidence', label: 'Evidences' },
    { id: 'summary', label: 'Summary' },
    { id: 'generate', label: 'Generate Report' }
  ];

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">DVAReporter - Web</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 rounded ${tab === id ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="max-w-6xl mx-auto">
        {tab === 'project' && (
          <ProjectInfo value={projectInfo} onChange={setProjectInfo} />
        )}
        {tab === 'vulnerabilities' && (
          <VulnerabilityPicker selected={selectedVulns} setSelected={setSelectedVulns} />
        )}
        {tab === 'manage' && <ManageVulns />}
        {tab === 'evidence' && (
          <EvidenceEditor
            selectedVulnerabilities={selectedVulns}
            evidenceMap={evidenceMap}
            onUpdateEvidence={(id, steps) =>
              setEvidenceMap(prev => ({ ...prev, [id]: steps }))
            }
          />
        )}
        {tab === 'summary' && (
          <SummaryView selectedVulnerabilities={selectedVulns} evidenceData={evidenceMap} />
        )}
        {tab === 'generate' && (
          <ReportForm selected={selectedVulns} evidenceMap={evidenceMap} projectInfo={projectInfo} />
        )}
      </div>

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}

export default App;
