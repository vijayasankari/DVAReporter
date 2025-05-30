// src/api.js
const API_BASE_URL = "http://127.0.0.1:8000";

export const getToken = () => localStorage.getItem("token");

export const authorizedFetch = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "API request failed");
  }

  return response.json();
};

export const authorizedPostFile = async (endpoint, file) => {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "File upload failed");
  }

  return response.json();
};
