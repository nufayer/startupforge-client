import { NextResponse } from "next/server";
import { getDb, collections } from "@/lib/mongo";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function PUT(req, { params }) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const user = session?.user;

    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (user.role !== "Founder") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { id } = await params;
    if (!ObjectId.isValid(id)) return NextResponse.json({ message: "Invalid application id" }, { status: 400 });

    const body = await req.json();
    const newStatus = body.Status || body.status;
    if (!["Accepted", "Rejected", "Pending"].includes(newStatus)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const db = await getDb();
    const colApps = db.collection(collections.applications);
    const colOpp = db.collection(collections.opportunities);
    const colStartups = db.collection(collections.startups);

    const existing = await colApps.findOne({ _id: new ObjectId(id) });
    if (!existing) return NextResponse.json({ message: "Application not found" }, { status: 404 });

    const opportunity = await colOpp.findOne({ _id: existing.Opportunity_id });
    if (!opportunity) return NextResponse.json({ message: "Opportunity not found" }, { status: 404 });

    const startup = await colStartups.findOne({ _id: opportunity.startup_id });
    if (!startup) return NextResponse.json({ message: "Startup not found" }, { status: 404 });

    if (String(startup.founder_email).trim().toLowerCase() !== String(user.email).trim().toLowerCase()) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await colApps.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          Status: newStatus,
          updated_at: new Date(),
        },
      }
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PUT /api/applications/:id/status error:", e);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
