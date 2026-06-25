import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb, collections } from "@/lib/mongo";
import { ObjectId } from "mongodb";

export async function PUT(req, { params }) {
  const admin = await requireAdmin(req);
  if (admin.error) return NextResponse.json({ message: admin.error }, { status: admin.status });

  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!["Approved", "Rejected", "Deleted"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const db = await getDb();
    const startupsCol = db.collection(collections.startups);

    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return NextResponse.json({ message: "Invalid startup ID" }, { status: 400 });
    }

    const result = await startupsCol.updateOne(
      { _id: objectId },
      { $set: { status } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Startup not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, status });
  } catch (e) {
    console.error("Admin startup status error:", e);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
