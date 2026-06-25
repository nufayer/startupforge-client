import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";
import { getDb, collections } from "@/lib/mongo";

export async function POST(req) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const sessionId = body.session_id;

    if (!sessionId) {
      return NextResponse.json({ message: "Missing session_id" }, { status: 400 });
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkoutSession.payment_status !== "paid") {
      return NextResponse.json({ message: "Payment not completed" }, { status: 400 });
    }

    const db = await getDb();
    const users = db.collection("user");

    await users.updateOne(
      { email: user.email },
      { $set: { plan: "Premium" } }
    );

    return NextResponse.json({ ok: true, plan: "Premium" });
  } catch (e) {
    console.error("Verify payment error:", e);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
