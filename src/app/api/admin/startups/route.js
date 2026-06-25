import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb, collections } from "@/lib/mongo";

export async function GET(req) {
  const admin = await requireAdmin(req);
  if (admin.error) return NextResponse.json({ message: admin.error }, { status: admin.status });

  try {
    const db = await getDb();
    const startupsCol = db.collection(collections.startups);

    const startups = await startupsCol
      .find({ status: { $ne: "Deleted" } })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ startups });
  } catch (e) {
    console.error("Admin startups error:", e);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
