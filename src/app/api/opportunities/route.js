import { NextResponse } from "next/server";
import { getDb, collections } from "@/lib/mongo";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(req) {
  const url = new URL(req.url);
  const startupId = url.searchParams.get("startupId") || url.searchParams.get("startup_id");
  const founderView = url.searchParams.get("founderView") === "true";

  try {
    const db = await getDb();
    const colOpp = db.collection(collections.opportunities);
    const colStartups = db.collection(collections.startups);

    // Public browse - list all open opportunities
    if (!startupId) {
      const opportunities = await colOpp
        .find({ status: "Open" })
        .sort({ updated_at: -1 })
        .toArray();
      return NextResponse.json({ opportunities });
    }

    if (!ObjectId.isValid(startupId)) {
      return NextResponse.json({ message: "Invalid startupId" }, { status: 400 });
    }

    // Founder view - requires auth + ownership check
    if (founderView) {
      const session = await auth.api.getSession({ headers: req.headers });
      const user = session?.user;
      if (!user || user.role !== "Founder") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }

      const pipeline = [
        { $match: { startup_id: new ObjectId(startupId), status: { $ne: "Deleted" } } },
        {
          $lookup: {
            from: collections.startups,
            localField: "startup_id",
            foreignField: "_id",
            as: "startup",
          },
        },
        { $unwind: "$startup" },
        { $match: { "startup.founder_email": String(user.email).trim().toLowerCase() } },
      ];

      const opportunities = await colOpp.aggregate(pipeline).toArray();
      return NextResponse.json({ opportunities });
    }

    // Public view - return open opportunities for this startup
    const opportunities = await colOpp
      .find({ startup_id: new ObjectId(startupId), status: "Open" })
      .sort({ updated_at: -1 })
      .toArray();
    return NextResponse.json({ opportunities });
  } catch (e) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const user = session?.user;

    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (user.role !== "Founder") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await req.json();

    const startup_id = body.startup_id;
    const role_title = body.role_title || body.title;
    if (!startup_id || !role_title) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }
    if (!ObjectId.isValid(startup_id)) {
      return NextResponse.json({ message: "Invalid startup_id" }, { status: 400 });
    }

    const db = await getDb();
    const colStartups = db.collection(collections.startups);
    const colOpp = db.collection(collections.opportunities);

    const startup = await colStartups.findOne({ _id: new ObjectId(startup_id) });
    if (!startup) return NextResponse.json({ message: "Invalid startup_id" }, { status: 400 });

    if (String(startup.founder_email).trim().toLowerCase() !== String(user.email).trim().toLowerCase()) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const opportunity = {
      startup_id: new ObjectId(startup_id),
      role_title,
      required_skills: body.required_skills || "",
      work_type: body.work_type || "",
      commitment_level: body.commitment_level || "",
      deadline: body.deadline || null,
      status: "Open",
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await colOpp.insertOne(opportunity);
    return NextResponse.json({ insertedId: result.insertedId }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
