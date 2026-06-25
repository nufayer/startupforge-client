export const API_BASE = "http://localhost:5000";

export async function apiFetch(path, options = {}) {
  const { headers: extraHeaders, ...rest } = options;
  const headers = { ...extraHeaders };

  if (typeof window !== "undefined") {
    try {
      const { authClient } = await import("@/lib/auth.client");
      const session = authClient.getSession();
      if (session?.data?.user) {
        headers["x-user-email"] = session.data.user.email || "";
        headers["x-user-role"] = session.data.user.role || "";
      }
    } catch {}
  }

  if (rest.body && typeof rest.body === "object" && !(rest.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(`${API_BASE}${path}`, { ...rest, headers });
}
