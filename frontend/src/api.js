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

  // The server checks currentPassword against the stored hash before
  // allowing the change.
  changePassword: (id, currentPassword, newPassword) =>
    request("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ id, currentPassword, newPassword }),
    }),

  fetchUsers: () => request("/users"),

  // payload: { name, role, department?, program?, year? } — department/
  // program/year only matter when role === "student".
  registerUser: (payload) =>
    request("/users/register", { method: "POST", body: JSON.stringify(payload) }),

  // payload: any subset of { department, program, year } — only sent
  // fields are changed. Used both to fill in missing details on an older
  // account and for the yearly "promote to next year" edit.
  updateStudent: (id, payload) =>
    request(`/users/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  deleteUser: (id) => request(`/users/${id}`, { method: "DELETE" }),

  fetchSubjects: () => request("/subjects"),

  // Replaces a faculty member's entire subject assignment with the given
  // list of subject IDs — used by the Admin portal's "Edit subjects" panel.
  updateFacultySubjects: (facultyName, subjectIds) =>
    request("/subjects/faculty-assignments", {
      method: "PUT",
      body: JSON.stringify({ facultyName, subjectIds }),
    }),

  fetchFeedback: () => request("/feedback"),

  submitFeedback: (payload) =>
    request("/feedback", { method: "POST", body: JSON.stringify(payload) }),
};