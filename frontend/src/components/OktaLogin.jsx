// src/components/OktaLogin.jsx
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function OktaLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [oktaGroup, setOktaGroup] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:8000/token", {
        username,
        password: "",        // Okta users won't provide this
        okta_group: oktaGroup
      });

      const { access_token, role, username: uname } = res.data;
      localStorage.setItem("token", access_token);
      localStorage.setItem("role", role);
      localStorage.setItem("username", uname);
      onLogin(access_token);
      toast.success("✅ Logged in via Okta");
    } catch (err) {
      toast.error(`❌ ${err.response?.data?.detail || "Login failed"}`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 border p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center">Login via Okta</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Okta Username"
          className="border p-2 w-full rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Okta Group (e.g. dvareporter-admins)"
          className="border p-2 w-full rounded"
          value={oktaGroup}
          onChange={(e) => setOktaGroup(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded w-full"
        >
          Login with Okta
        </button>
      </form>
    </div>
  );
}

export default OktaLogin;
