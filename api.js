const API_URL = import.meta.env.VITE_API_URL || "/api";

const TOKEN_KEY = "budget-buddy-session";

export function getSessionToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveSession(session) {
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem("budget-buddy-user", JSON.stringify(session.user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("budget-buddy-user");
}

export async function apiRequest(path, options = {}) {
  const token = getSessionToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error || "Could not connect to Budget Vision.");
  }
  return response.status === 204 ? null : response.json();
}
