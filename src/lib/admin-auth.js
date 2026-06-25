import { auth } from "@/lib/auth";

export async function requireAdmin(req) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return { error: "Unauthorized", status: 401 };
    if (session.user.role !== "Admin") return { error: "Forbidden", status: 403 };
    return { user: session.user };
  } catch {
    return { error: "Unauthorized", status: 401 };
  }
}
