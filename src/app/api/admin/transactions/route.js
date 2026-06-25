import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req) {
  const admin = await requireAdmin(req);
  if (admin.error) return NextResponse.json({ message: admin.error }, { status: admin.status });

  try {
    const { stripe } = await import("@/lib/stripe");

    const sessions = await stripe.checkout.sessions.list({ limit: 100 });
    const charges = await stripe.charges.list({ limit: 100 });

    const transactions = sessions.data.map((s) => {
      const charge = charges.data.find((c) => c.payment_intent === s.payment_intent);
      return {
        id: s.id,
        user: s.customer_details?.email || s.metadata?.email || "Unknown",
        amount: (s.amount_total || 0) / 100,
        currency: (s.currency || "usd").toUpperCase(),
        date: new Date(s.created * 1000).toISOString(),
        payment_status: s.payment_status === "paid" ? "Paid" : s.payment_status,
        status: s.status,
      };
    });

    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    return NextResponse.json({ transactions });
  } catch (e) {
    console.error("Admin transactions error:", e);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
