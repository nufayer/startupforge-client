import { NextResponse } from "next/server";
import { getDb, collections } from "@/lib/mongo";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid id" }, { status: 400 });
    }

    const db = await getDb();
    const col = db.collection(collections.startups);

    const startup = await col.findOne({ _id: new ObjectId(id) });
    if (!startup || startup.status === "Deleted") {
      return NextResponse.json({ message: "Startup not found" }, { status: 404 });
    }

    return NextResponse.json({ startup });
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "Founder") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();

    const db = await getDb();
    const col = db.collection(collections.startups);

    const existing = await col.findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return NextResponse.json({ message: "Startup not found" }, { status: 404 });
    }

    if (existing.founder_email !== String(user.email).trim().toLowerCase()) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const update = {
      startup_name: body.startup_name ?? existing.startup_name,
      logo: body.logo ?? existing.logo,
      industry: body.industry ?? existing.industry,
      description: body.description ?? existing.description,
      funding_stage: body.funding_stage ?? existing.funding_stage,
      status: body.status ?? existing.status,
      updated_at: new Date(),
    };

    await col.updateOne({ _id: new ObjectId(id) }, { $set: update });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PUT /api/startups/:id error:", e);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "Founder") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid id" }, { status: 400 });
    }

    const db = await getDb();
    const col = db.collection(collections.startups);

    const existing = await col.findOne({ _id: new ObjectId(id) });
    if (!existing) {
      return NextResponse.json({ message: "Startup not found" }, { status: 404 });
    }

    if (existing.founder_email !== String(user.email).trim().toLowerCase()) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await col.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "Deleted", updated_at: new Date() } }
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/startups/:id error:", e);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
