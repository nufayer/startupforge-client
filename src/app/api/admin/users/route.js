import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb, collections } from "@/lib/mongo";

export async function GET(req) {
  const admin = await requireAdmin(req);
  if (admin.error) return NextResponse.json({ message: admin.error }, { status: admin.status });

  try {
    const db = await getDb();
    const usersCol = db.collection(collections.users);

    const users = await usersCol
      .find({}, { projection: { name: 1, email: 1, role: 1, plan: 1, banned: 1, createdAt: 1 } })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ users });
  } catch (e) {
    console.error("Admin users error:", e);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
