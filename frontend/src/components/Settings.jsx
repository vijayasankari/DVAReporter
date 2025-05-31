// src/components/Settings.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function Settings({ onClose }) {
  const [users, setUsers] = useState([]);
  const [dbConfig, setDbConfig] = useState({
    db_type: "sqlserver",
    host: "",
    port: "",
    db_name: "",
    user: "",
    password: ""
  });

  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "User",
    is_okta: false,
    okta_group: ""
  });

  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("role") === "Admin";

  const axiosAuth = axios.create({
    baseURL: "http://127.0.0.1:8000",
    headers: { Authorization: `Bearer ${token}` }
  });

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchDBConfig();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axiosAuth.get("/admin/users/");
      setUsers(res.data);
    } catch {
      toast.error("❌ Failed to fetch users");
    }
  };

  const fetchDBConfig = async () => {
    try {
      const res = await axiosAuth.get("/admin/config/db/");
      setDbConfig(res.data || {});
    } catch {
      toast.error("❌ Failed to fetch DB config");
    }
  };

  const handleCreateUser = async () => {
    try {
      const payload = {
        ...newUser,
        is_okta: Boolean(newUser.is_okta),
        okta_group: newUser.is_okta ? newUser.okta_group : ""
      };
      const res = await axiosAuth.post("/admin/users/", payload);
      toast.success(`✅ User '${res.data.username}' created`);
      setNewUser({ username: "", password: "", role: "User", is_okta: false, okta_group: "" });
      fetchUsers();
    } catch (err) {
      toast.error(`❌ ${err.response?.data?.detail || "Failed to create user"}`);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axiosAuth.delete(`/admin/users/${id}`);
      toast.success("🗑️ User deleted");
      fetchUsers();
    } catch {
      toast.error("❌ Failed to delete user");
    }
  };

  const saveDBConfig = async () => {
    try {
      await axiosAuth.post("/admin/config/db/", dbConfig);
      toast.success("✅ DB configuration saved");
    } catch {
      toast.error("❌ Failed to save DB configuration");
    }
  };

  if (!isAdmin) {
    return <div className="text-center text-red-600">Access denied. Admin only.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Admin Settings</h2>
        <button className="bg-gray-200 px-3 py-1 rounded" onClick={onClose}>← Back</button>
      </div>

      {/* User Management */}
      <div className="border p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Create New User</h3>
        <div className="grid grid-cols-2 gap-4">
          <input placeholder="Username" className="border p-2 rounded" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} />
          <input type="password" placeholder="Password" className="border p-2 rounded" value={newUser.password} disabled={newUser.is_okta} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
          <select className="border p-2 rounded" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}><option>User</option><option>Admin</option></select>
          <label className="flex items-center gap-2"><input type="checkbox" checked={newUser.is_okta} onChange={(e) => setNewUser({ ...newUser, is_okta: e.target.checked })} /> Okta-based account</label>
          {newUser.is_okta && <input placeholder="Okta Group Name" className="border p-2 rounded col-span-2" value={newUser.okta_group} onChange={(e) => setNewUser({ ...newUser, okta_group: e.target.value })} />}
        </div>
        <button className="bg-blue-600 text-white px-6 py-2 rounded mt-4" onClick={handleCreateUser}>Create User</button>
      </div>

      {/* User List */}
      <div className="border p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Existing Users</h3>
        <ul className="space-y-2">
          {users.map((u) => (
            <li key={u.id} className="flex justify-between items-center border p-2 rounded">
              <div>{u.username} ({u.role}) {u.okta_group && <span className="text-sm text-gray-500">— {u.okta_group}</span>}</div>
              <button className="text-red-600 text-sm" onClick={() => handleDeleteUser(u.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>

      {/* DB Configuration */}
      <div className="border p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Database Configuration</h3>
        <div className="grid grid-cols-2 gap-4">
          <select className="border p-2 rounded" value={dbConfig.db_type} onChange={(e) => setDbConfig({ ...dbConfig, db_type: e.target.value })}><option value="sqlserver">SQL Server</option><option value="mysql">MySQL</option><option value="sqlite">SQLite</option></select>
          <input placeholder="Host" className="border p-2 rounded" value={dbConfig.host} onChange={(e) => setDbConfig({ ...dbConfig, host: e.target.value })} />
          <input placeholder="Port" className="border p-2 rounded" value={dbConfig.port} onChange={(e) => setDbConfig({ ...dbConfig, port: e.target.value })} />
          <input placeholder="Database Name" className="border p-2 rounded" value={dbConfig.db_name} onChange={(e) => setDbConfig({ ...dbConfig, db_name: e.target.value })} />
          <input placeholder="User" className="border p-2 rounded" value={dbConfig.user} onChange={(e) => setDbConfig({ ...dbConfig, user: e.target.value })} />
          <input type="password" placeholder="Password" className="border p-2 rounded" value={dbConfig.password} onChange={(e) => setDbConfig({ ...dbConfig, password: e.target.value })} />
        </div>
        <button className="bg-green-600 text-white px-6 py-2 rounded mt-4" onClick={saveDBConfig}>Save DB Configuration</button>
      </div>
    </div>
  );
}

export default Settings;
