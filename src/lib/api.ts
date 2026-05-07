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
      errorMsg = data.error || data.message || JSON.stringify(data);
      // Check for invalid/expired token errors (customize as needed)
      if (
        status === 401 ||
        errorMsg.toLowerCase().includes("token") ||
        errorMsg.toLowerCase().includes("unauthorized")
      ) {
        // Remove auth info
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        
        // Only redirect if we are not already on the auth page
        if (window.location.pathname !== "/auth") {
          window.location.replace("/auth");
          return; // Prevent further execution
        }
      }
    } catch (e) {
      // ignore JSON parse error
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

/** Multipart upload (do not set Content-Type; browser sets boundary). */
export async function apiUpload(path: string, formData: FormData) {
  const token = localStorage.getItem("authToken");
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
    credentials: "include",
  });
  if (!res.ok) {
    let errorMsg = "Unknown error";
    const status = res.status;
    try {
      const data = await res.json();
      errorMsg = data.error || data.message || JSON.stringify(data);
      if (
        status === 401 ||
        errorMsg.toLowerCase().includes("token") ||
        errorMsg.toLowerCase().includes("unauthorized")
      ) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        if (window.location.pathname !== "/auth") {
          window.location.replace("/auth");
          return;
        }
      }
    } catch {
      /* ignore */
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

/** Download a file (non-JSON) with auth; triggers browser download. */
export async function apiDownloadBlob(
  path: string,
  fallbackFilename = "download",
) {
  const token = localStorage.getItem("authToken");
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  });
  if (!res.ok) {
    let errorMsg = "Download failed";
    const status = res.status;
    try {
      const data = await res.json();
      errorMsg = data.error || data.message || errorMsg;
      if (
        status === 401 ||
        String(errorMsg).toLowerCase().includes("token") ||
        String(errorMsg).toLowerCase().includes("unauthorized")
      ) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        if (window.location.pathname !== "/auth") {
          window.location.replace("/auth");
          return;
        }
      }
    } catch {
      /* ignore */
    }
    throw new Error(errorMsg);
  }
  const blob = await res.blob();
  const cd = res.headers.get("Content-Disposition");
  let filename = fallbackFilename;
  if (cd) {
    const utf8Name = cd.match(/filename\*=UTF-8''([^;\s]+)/i);
    const quotedName = cd.match(/filename="([^"]+)"/i);
    const plainName = cd.match(/filename=([^;\s"]+)/i);
    const raw =
      utf8Name?.[1] ?? quotedName?.[1] ?? plainName?.[1] ?? null;
    if (raw) {
      try {
        filename = decodeURIComponent(raw.replace(/^"|"$/g, "").trim());
      } catch {
        filename = raw.replace(/^"|"$/g, "").trim();
      }
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
