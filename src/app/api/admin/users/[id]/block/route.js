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
    const { banned } = body;

    const db = await getDb();
    const usersCol = db.collection(collections.users);

    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch {
      return NextResponse.json({ message: "Invalid user ID" }, { status: 400 });
    }

    const result = await usersCol.updateOne(
      { _id: objectId },
      { $set: { banned: !!banned } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, banned: !!banned });
  } catch (e) {
    console.error("Admin block user error:", e);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
