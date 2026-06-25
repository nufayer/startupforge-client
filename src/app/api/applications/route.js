import { NextResponse } from "next/server";
import { getDb, collections } from "@/lib/mongo";
import { auth } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(req) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const user = session?.user;

    const url = new URL(req.url);
    const applicantEmail = url.searchParams.get("applicantEmail") || url.searchParams.get("applicant_email");
    const opportunityId = url.searchParams.get("opportunityId") || url.searchParams.get("opportunity_id");
    const startupId = url.searchParams.get("startupId") || url.searchParams.get("startup_id");

    const db = await getDb();
    const colApps = db.collection(collections.applications);
    const colOpp = db.collection(collections.opportunities);
    const colStartups = db.collection(collections.startups);

    if (opportunityId) {
      if (!user || user.role !== "Founder") return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      if (!ObjectId.isValid(opportunityId)) return NextResponse.json({ message: "Invalid opportunityId" }, { status: 400 });

      const pipeline = [
        { $match: { Opportunity_id: new ObjectId(opportunityId) } },
        {
          $lookup: {
            from: collections.opportunities,
            localField: "Opportunity_id",
            foreignField: "_id",
            as: "opportunity",
          },
        },
        { $unwind: "$opportunity" },
        {
          $lookup: {
            from: collections.startups,
            localField: "opportunity.startup_id",
            foreignField: "_id",
            as: "startup",
          },
        },
        { $unwind: "$startup" },
        { $match: { "startup.founder_email": String(user.email).trim().toLowerCase() } },
        {
          $project: {
            _id: 1,
            Opportunity_id: 1,
            Applicant_email: 1,
            Portfolio_link: 1,
            Motivation: 1,
            Status: 1,
            applied_at: 1,
            opportunity: { role_title: "$opportunity.role_title" },
            startup: { startup_name: "$startup.startup_name" },
          },
        },
        { $sort: { applied_at: -1 } },
      ];

      const applications = await colApps.aggregate(pipeline).toArray();
      return NextResponse.json({ applications });
    }

    if (applicantEmail) {
      if (!user || user.role !== "Collaborator") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

      const safeApplicant = String(applicantEmail).trim().toLowerCase();
      if (String(user.email).trim().toLowerCase() !== safeApplicant) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }

      const pipeline = [
        { $match: { Applicant_email: safeApplicant } },
        {
          $lookup: {
            from: collections.opportunities,
            localField: "Opportunity_id",
            foreignField: "_id",
            as: "opportunity",
          },
        },
        { $unwind: { path: "$opportunity", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: collections.startups,
            localField: "opportunity.startup_id",
            foreignField: "_id",
            as: "startup",
          },
        },
        { $unwind: { path: "$startup", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            Opportunity_id: 1,
            Applicant_email: 1,
            Portfolio_link: 1,
            Motivation: 1,
            Status: 1,
            applied_at: 1,
            created_at: 1,
            updated_at: 1,
            role_title: "$opportunity.role_title",
            startup_name: "$startup.startup_name",
            startup_logo: "$startup.logo",
          },
        },
        { $sort: { applied_at: -1 } },
      ];

      const applications = await colApps.aggregate(pipeline).toArray();
      return NextResponse.json({ applications });
    }

    if (startupId) {
      if (!user || user.role !== "Founder") return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      if (!ObjectId.isValid(startupId)) return NextResponse.json({ message: "Invalid startupId" }, { status: 400 });

      const pipeline = [
        {
          $lookup: {
            from: collections.opportunities,
            localField: "Opportunity_id",
            foreignField: "_id",
            as: "opportunity",
          },
        },
        { $unwind: "$opportunity" },
        { $match: { "opportunity.startup_id": new ObjectId(startupId) } },
        {
          $lookup: {
            from: collections.startups,
            localField: "opportunity.startup_id",
            foreignField: "_id",
            as: "startup",
          },
        },
        { $unwind: "$startup" },
        { $match: { "startup.founder_email": String(user.email).trim().toLowerCase() } },
        {
          $project: {
            _id: 1,
            Opportunity_id: 1,
            Applicant_email: 1,
            Portfolio_link: 1,
            Motivation: 1,
            Status: 1,
            applied_at: 1,
            opportunity: { role_title: "$opportunity.role_title" },
            startup: { startup_name: "$startup.startup_name" },
          },
        },
        { $sort: { applied_at: -1 } },
      ];

      const applications = await colApps.aggregate(pipeline).toArray();
      return NextResponse.json({ applications });
    }

    return NextResponse.json({ message: "Provide applicantEmail, opportunityId, or startupId" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const user = session?.user;

    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    if (user.role !== "Collaborator") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await req.json();

    const opportunityId = body.Opportunity_id || body.opportunity_id || body.opportunityId;
    const applicantEmail = body.Applicant_email || body.applicant_email || body.applicantEmail || user.email;

    if (!opportunityId) return NextResponse.json({ message: "opportunity_id is required" }, { status: 400 });

    if (!ObjectId.isValid(opportunityId)) return NextResponse.json({ message: "Invalid opportunity_id" }, { status: 400 });

    const safeApplicantEmail = String(applicantEmail).trim().toLowerCase();

    if (String(user.email).trim().toLowerCase() !== safeApplicantEmail) {
      return NextResponse.json({ message: "Cannot apply as another user" }, { status: 403 });
    }

    const db = await getDb();
    const colOpp = db.collection(collections.opportunities);
    const colApps = db.collection(collections.applications);

    const opportunity = await colOpp.findOne({ _id: new ObjectId(opportunityId) });
    if (!opportunity) return NextResponse.json({ message: "Opportunity not found" }, { status: 404 });

    const existing = await colApps.findOne({
      Opportunity_id: new ObjectId(opportunityId),
      Applicant_email: safeApplicantEmail,
    });

    if (existing) {
      return NextResponse.json({ message: "Already applied for this opportunity" }, { status: 409 });
    }

    const application = {
      Opportunity_id: new ObjectId(opportunityId),
      Applicant_email: safeApplicantEmail,
      Portfolio_link: body.Portfolio_link || body.portfolio_link || body.portfolioLink || "",
      Motivation: body.Motivation || body.motivation || body.motivation_message || body.motivationMessage || "",
      Status: "Pending",
      applied_at: new Date().toISOString(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    const result = await colApps.insertOne(application);
    return NextResponse.json({ insertedId: result.insertedId }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
