// src/components/Dashboard.jsx
import { useState } from "react";
import ProjectInfo from "./ProjectInfo";
import VulnerabilityPicker from "./VulnerabilityPicker";
import ManageVulns from "./ManageVulns";
import EvidenceEditor from "./EvidenceEditor";
import SummaryView from "./SummaryView";
import ReportForm from "./ReportForm";
import Settings from "./Settings";
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

function Dashboard({ token }) {
  const [tab, setTab] = useState("project");
  const [projectInfo, setProjectInfo] = useState({
    title: "",
    scope: "",
    urls: "",
    analyst: "",
    requester: ""
  });
  const [selectedVulns, setSelectedVulns] = useState([]);
  const [evidenceMap, setEvidenceMap] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  const role = localStorage.getItem("role") || "User";
  const username = localStorage.getItem("username") || "Unknown";

  const tabs = [
    { id: "project", label: "Project Info" },
    { id: "vulnerabilities", label: "Vulnerability Picker" },
    { id: "manage", label: "Manage Vulnerabilities" },
    { id: "evidence", label: "Evidences" },
    { id: "summary", label: "Summary" },
    { id: "generate", label: "Generate Report" }
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">DVAReporter</h1>
        <div className="flex gap-3 items-center">
          <span className="text-gray-600">Welcome, {username} ({role})</span>
          <button
            className="text-sm px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            onClick={() => setShowSettings(true)}
          >
            ⚙️ Settings
          </button>
          <button
            className="text-sm px-3 py-1 rounded bg-red-600 text-white"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {showSettings ? (
        role === "Admin" ? (
          <Settings onClose={() => setShowSettings(false)} />
        ) : (
          <div className="text-red-600 font-semibold text-center">
            ❌ Access Denied. Admins only.
          </div>
        )
      ) : (
        <>
          <div className="flex justify-center gap-2 mb-6">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded ${
                  tab === t.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="max-w-6xl mx-auto">
            {tab === "project" && (
              <ProjectInfo value={projectInfo} onChange={setProjectInfo} />
            )}
            {tab === "vulnerabilities" && (
              <VulnerabilityPicker
                selected={selectedVulns}
                setSelected={setSelectedVulns}
              />
            )}
            {tab === "manage" && <ManageVulns />}
            {tab === "evidence" && (
              <EvidenceEditor
                selectedVulnerabilities={selectedVulns}
                evidenceMap={evidenceMap}
                onUpdateEvidence={(id, updatedSteps) =>
                  setEvidenceMap((prev) => ({ ...prev, [id]: updatedSteps }))
                }
              />
            )}
            {tab === "summary" && (
              <SummaryView
                selectedVulnerabilities={selectedVulns}
                evidenceData={evidenceMap}
              />
            )}
            {tab === "generate" && (
              <ReportForm
                selected={selectedVulns}
                evidenceMap={evidenceMap}
                projectInfo={projectInfo}
              />
            )}
          </div>
        </>
      )}
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}

export default Dashboard;
