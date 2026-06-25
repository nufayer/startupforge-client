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
    const colOpp = db.collection(collections.opportunities);
    const colStartups = db.collection(collections.startups);

    const opp = await colOpp.findOne({ _id: new ObjectId(id) });
    if (!opp || opp.status === "Deleted") {
      return NextResponse.json({ message: "Opportunity not found" }, { status: 404 });
    }

    const startup = await colStartups.findOne({ _id: opp.startup_id });

    return NextResponse.json({ opportunity: { ...opp, startup } });
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const user = session?.user;

    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (user.role !== "Founder") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();

    const db = await getDb();
    const colOpp = db.collection(collections.opportunities);
    const colStartups = db.collection(collections.startups);

    const existing = await colOpp.findOne({ _id: new ObjectId(id) });
    if (!existing) return NextResponse.json({ message: "Opportunity not found" }, { status: 404 });

    const startup = await colStartups.findOne({ _id: existing.startup_id });
    if (!startup) return NextResponse.json({ message: "Startup not found" }, { status: 404 });

    if (String(startup.founder_email).trim().toLowerCase() !== String(user.email).trim().toLowerCase()) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const update = {
      role_title: body.role_title ?? body.title ?? existing.role_title,
      required_skills: body.required_skills ?? existing.required_skills,
      work_type: body.work_type ?? existing.work_type,
      commitment_level: body.commitment_level ?? existing.commitment_level,
      deadline: body.deadline ?? existing.deadline,
      updated_at: new Date(),
      status: body.status ?? existing.status,
    };

    await colOpp.updateOne({ _id: new ObjectId(id) }, { $set: update });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PUT /api/opportunities/:id error:", e);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const user = session?.user;

    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (user.role !== "Founder") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid id" }, { status: 400 });
    }

    const db = await getDb();
    const colOpp = db.collection(collections.opportunities);
    const colStartups = db.collection(collections.startups);

    const existing = await colOpp.findOne({ _id: new ObjectId(id) });
    if (!existing) return NextResponse.json({ message: "Opportunity not found" }, { status: 404 });

    const startup = await colStartups.findOne({ _id: existing.startup_id });
    if (!startup) return NextResponse.json({ message: "Startup not found" }, { status: 404 });

    if (String(startup.founder_email).trim().toLowerCase() !== String(user.email).trim().toLowerCase()) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await colOpp.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "Deleted", updated_at: new Date() } }
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/opportunities/:id error:", e);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
