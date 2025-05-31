import { useState, useEffect } from "react";
import ProjectInfo from "./ProjectInfo";
import VulnerabilityPicker from "./VulnerabilityPicker";
import ManageVulns from "./ManageVulns";
import EvidenceEditor from "./EvidenceEditor";
import SummaryView from "./SummaryView";
import ReportForm from "./ReportForm";
import Settings from "./Settings";
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import "react-toastify/dist/ReactToastify.css";

const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes

const ProfileModal = ({ onClose, onOpenSettings }) => {
  const username = localStorage.getItem("username") || "Unknown";
  const role = localStorage.getItem("role") || "User";
  const oktaGroup = localStorage.getItem("okta_group") || null;

  return (
    <div className="fixed top-16 right-4 bg-white border rounded shadow p-4 z-50 w-64">
      <h3 className="text-lg font-semibold mb-2">User Profile</h3>
      <p><strong>Username:</strong> {username}</p>
      <p><strong>Role:</strong> {role}</p>
      {oktaGroup && <p><strong>Okta Group:</strong> {oktaGroup}</p>}
      <div className="mt-4 flex justify-between">
        {role === "Admin" && (
          <button
            onClick={onOpenSettings}
            className="bg-blue-600 text-white text-sm px-3 py-1 rounded"
          >
            Settings
          </button>
        )}
        <button
          onClick={onClose}
          className="text-sm px-3 py-1 border rounded hover:bg-gray-100"
        >
          Close
        </button>
      </div>
    </div>
  );
};

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
  const [showProfile, setShowProfile] = useState(false);
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

  // Session timeout logic
  useEffect(() => {
    let inactivityTimer;
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        alert("You have been logged out due to inactivity.");
        handleLogout();
      }, INACTIVITY_LIMIT);
    };

    window.addEventListener("mousemove", resetInactivityTimer);
    window.addEventListener("keydown", resetInactivityTimer);
    window.addEventListener("scroll", resetInactivityTimer);
    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener("mousemove", resetInactivityTimer);
      window.removeEventListener("keydown", resetInactivityTimer);
      window.removeEventListener("scroll", resetInactivityTimer);
    };
  }, []);

  // Token expiration logic
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwt_decode(token);
        const now = Date.now() / 1000;
        if (decoded.exp && decoded.exp < now) {
          alert("Session expired. Please log in again.");
          handleLogout();
        }
      } catch (e) {
        console.warn("Invalid token");
        handleLogout();
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">DVAReporter</h1>
        <div className="relative flex gap-3 items-center">
  <button
    className="text-sm px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
    onClick={() => {
      setShowProfile(prev => !prev);
      console.log("Profile toggled");
    }}
  >
    👤 Profile
  </button>

  <button
    className="text-sm px-3 py-1 rounded bg-red-600 text-white"
    onClick={handleLogout}
  >
    Logout
  </button>
console.log("Dashboard loaded");
console.log("Username:", username);
console.log("Role:", role);
console.log("Rendering showProfile:", showProfile);
  {showProfile && (
    <ProfileModal
      onClose={() => setShowProfile(false)}
      onOpenSettings={() => {
        setShowProfile(false);
        setShowSettings(true);
      }}
    />
  )}
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
