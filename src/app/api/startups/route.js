import { NextResponse } from "next/server";
import { getDb, collections } from "@/lib/mongo";
import { auth } from "@/lib/auth";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const founderEmail = url.searchParams.get("founderEmail");

    const db = await getDb();
    const col = db.collection(collections.startups);

    const query = founderEmail
      ? { founder_email: String(founderEmail).trim().toLowerCase() }
      : { status: { $ne: "Deleted" } };

    const startups = await col.find(query).sort({ updated_at: -1 }).toArray();
    return NextResponse.json({ startups });
  } catch (e) {
    const isDev = process.env.NODE_ENV !== "production";
    return NextResponse.json(
      { message: isDev ? (e?.message || "Internal server error") : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "Founder") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const startup = {
      startup_name: body.startup_name,
      logo: body.logo || "",
      industry: body.industry,
      description: body.description,
      funding_stage: body.funding_stage,
      founder_email: body.founder_email || user.email,
      status: body.status ?? "Active",
      created_at: new Date(),
      updated_at: new Date(),
    };

    if (!startup.startup_name || !startup.industry || !startup.description || !startup.funding_stage) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }
    if (!startup.founder_email) {
      return NextResponse.json({ message: "Missing founder_email" }, { status: 400 });
    }

    const db = await getDb();
    const col = db.collection(collections.startups);

    const result = await col.insertOne(startup);
    return NextResponse.json({ insertedId: result.insertedId }, { status: 201 });
  } catch (e) {
    console.error("POST /api/startups error:", e);
    const isDev = process.env.NODE_ENV !== "production";
    return NextResponse.json(
      { message: isDev ? (e?.message || "Internal server error") : "Internal server error" },
      { status: 500 }
    );
  }
}
