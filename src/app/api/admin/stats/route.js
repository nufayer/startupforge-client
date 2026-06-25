import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb, collections } from "@/lib/mongo";

export async function GET(req) {
  const admin = await requireAdmin(req);
  if (admin.error) return NextResponse.json({ message: admin.error }, { status: admin.status });

  try {
    const db = await getDb();
    const usersCol = db.collection(collections.users);
    const startupsCol = db.collection(collections.startups);
    const opportunitiesCol = db.collection(collections.opportunities);

    const [totalUsers, totalStartups, totalOpportunities] = await Promise.all([
      usersCol.countDocuments({}),
      startupsCol.countDocuments({ status: { $ne: "Deleted" } }),
      opportunitiesCol.countDocuments({}),
    ]);

    let totalRevenue = 0;
    try {
      const { stripe } = await import("@/lib/stripe");
      const payments = await stripe.charges.list({ limit: 100 });
      totalRevenue = payments.data
        .filter((c) => c.paid && c.amount_received)
        .reduce((sum, c) => sum + c.amount_received, 0);
    } catch {
      totalRevenue = 0;
    }

    return NextResponse.json({
      totalUsers,
      totalStartups,
      totalOpportunities,
      totalRevenue,
    });
  } catch (e) {
    console.error("Admin stats error:", e);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
