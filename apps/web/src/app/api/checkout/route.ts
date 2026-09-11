import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOrCreateCustomer, createCheckoutSession, PRICE_IDS } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { plan, interval = "monthly" } = body;

    // Validate plan
    if (!plan || !["creator", "pro", "team"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Get or create Stripe customer
    const customer = await getOrCreateCustomer(
      session.user.id,
      session.user.email,
      session.user.name || undefined
    );

    // Update user with Stripe customer ID if not set
    if (!customer.metadata?.userId) {
      // Customer was created fresh, metadata should be set
    }

    // Get price ID
    const priceId = PRICE_IDS[plan as keyof typeof PRICE_IDS]?.[interval as "monthly" | "yearly"];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid price configuration" }, { status: 500 });
    }

    // Create checkout session
    const checkoutSession = await createCheckoutSession(
      customer.id,
      priceId,
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/settings?upgraded=true`,
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/billing?cancelled=true`,
      {
        userId: session.user.id,
        plan,
      }
    );

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
