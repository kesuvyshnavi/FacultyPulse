const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch (networkErr) {
    throw new Error("Could not reach the server. Is it running on port 5000?");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Something went wrong.");
  }
  return data;
}

// (4e) Every call here hits the Express API in /server, which talks to
// MySQL — this is the frontend/backend/database connection end to end.
export const api = {
  login: (id, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ id, password }) }),

  changePassword: (id, newPassword) =>
    request("/auth/change-password", { method: "POST", body: JSON.stringify({ id, newPassword }) }),

  fetchUsers: () => request("/users"),

  registerUser: (name, role) =>
    request("/users/register", { method: "POST", body: JSON.stringify({ name, role }) }),

  fetchSubjects: () => request("/subjects"),

  fetchFeedback: () => request("/feedback"),

  submitFeedback: (payload) =>
    request("/feedback", { method: "POST", body: JSON.stringify(payload) }),
};
