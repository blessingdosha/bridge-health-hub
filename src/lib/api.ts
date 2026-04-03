// Central API utility for backend integration
// Handles base URL, auth token, and error handling

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:7777";

export async function apiFetch(
  path: string,
  options: Record<string, any> = {},
) {
  const token = localStorage.getItem("authToken");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ? options.headers : {}),
  };
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include", // <-- This ensures cookies/sessions work and CORS is satisfied
  });
  if (!res.ok) {
    let errorMsg = "Unknown error";
    let status = res.status;
    try {
      const data = await res.json();
      errorMsg = data.message || JSON.stringify(data);
      // Check for invalid/expired token errors (customize as needed)
      if (
        status === 401 ||
        errorMsg.toLowerCase().includes("token") ||
        errorMsg.toLowerCase().includes("unauthorized")
      ) {
        // Remove auth info and redirect to login
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        window.location.replace("/auth");
        // Prevent further execution
        return;
      }
    } catch (e) {
      // ignore JSON parse error
    }
    throw new Error(errorMsg);
  }
  return res.json();
}
