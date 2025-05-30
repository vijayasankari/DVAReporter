// src/components/Settings.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function Settings({ onClose }) {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role: "User",
    isOkta: false,
    oktaGroup: ""
  });

  const token = localStorage.getItem("token");
  const isAdmin = localStorage.getItem("role") === "Admin";

  const axiosAuth = axios.create({
    baseURL: "http://127.0.0.1:8000",
    headers: { Authorization: `Bearer ${token}` }
  });

  const fetchUsers = async () => {
    try {
      const res = await axiosAuth.get("/admin/users/");
      setUsers(res.data);
    } catch (err) {
      toast.error("❌ Failed to fetch users");
    }
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    try {
      await axiosAuth.post("/admin/users/", newUser);
      toast.success("✅ User created");
      setNewUser({ username: "", password: "", role: "User", isOkta: false, oktaGroup: "" });
      fetchUsers();
    } catch (err) {
      toast.error("❌ Failed to create user");
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

  const handleDBConfig = async () => {
    try {
      await axiosAuth.post("/admin/config/db/", {
        db_type: "sqlserver",
        host: "examplehost",
        port: 1433,
        db_name: "exampledb",
        user: "exampleuser",
        password: "examplepass"
      });
      toast.success("✅ DB configuration updated (mock)");
    } catch {
      toast.error("❌ Failed to update DB config");
    }
  };

  if (!isAdmin) return <div className="text-center text-red-600">Access denied. Admin only.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Admin Settings</h2>
        <button
          className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
          onClick={onClose}
        >
          ← Back
        </button>
      </div>

      <div className="border p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Create New User</h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Username"
            className="border p-2 rounded"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-2 rounded"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
          <select
            className="border p-2 rounded"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            <option>User</option>
            <option>Admin</option>
          </select>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newUser.isOkta}
              onChange={(e) => setNewUser({ ...newUser, isOkta: e.target.checked })}
            />
            Use Okta Group
          </label>
          {newUser.isOkta && (
            <input
              placeholder="Okta Group Name"
              className="border p-2 rounded col-span-2"
              value={newUser.oktaGroup}
              onChange={(e) => setNewUser({ ...newUser, oktaGroup: e.target.value })}
            />
          )}
        </div>
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded mt-4"
          onClick={handleCreateUser}
        >
          Create User
        </button>
      </div>

      <div className="border p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Existing Users</h3>
        <ul className="space-y-2">
          {users.map((u) => (
            <li key={u.id} className="flex justify-between items-center border p-2 rounded">
              <div>{u.username} ({u.role}) {u.okta_group && `- ${u.okta_group}`}</div>
              <button
                className="text-red-600 text-sm"
                onClick={() => handleDeleteUser(u.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="border p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Database Configuration</h3>
        <p className="text-sm text-gray-600 mb-2">(This is a placeholder for now)</p>
        <button
          className="bg-green-600 text-white px-6 py-2 rounded"
          onClick={handleDBConfig}
        >
          Configure DB
        </button>
      </div>
    </div>
  );
}

export default Settings;
