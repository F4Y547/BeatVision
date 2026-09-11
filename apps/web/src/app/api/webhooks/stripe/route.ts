import { NextResponse } from "next/server";
import { stripe, type PlanTier } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

// Map Stripe price ID to plan tier
function getPlanFromPriceId(priceId: string): PlanTier {
  if (priceId.includes("creator")) return "creator";
  if (priceId.includes("pro")) return "pro";
  if (priceId.includes("team")) return "team";
  return "free";
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not set");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle different event types
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const priceId = subscription.items.data[0]?.price.id;

        // Find user by Stripe customer ID
        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (!user) {
          console.error("User not found for customer:", customerId);
          break;
        }

        // Upsert subscription
        await db.subscription.upsert({
          where: { stripeSubscriptionId: subscription.id },
          create: {
            userId: user.id,
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          },
          update: {
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            stripePriceId: priceId,
          },
        });

        console.log("Subscription updated:", subscription.id);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          await db.subscription.deleteMany({
            where: { stripeSubscriptionId: subscription.id },
          });
          console.log("Subscription deleted:", subscription.id);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user && invoice.payment_intent) {
          // Record payment
          await db.payment.create({
            data: {
              userId: user.id,
              stripePaymentId: invoice.payment_intent as string,
              amount: invoice.amount_paid,
              currency: invoice.currency,
              status: "succeeded",
              description: `Subscription payment for ${invoice.subscription}`,
            },
          });

          // Record usage
          await db.usageRecord.create({
            data: {
              userId: user.id,
              type: "subscription_payment",
              amount: invoice.amount_paid,
              metadata: {
                invoiceId: invoice.id,
                subscriptionId: invoice.subscription as string,
              },
            },
          });

          console.log("Payment recorded:", invoice.payment_intent);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          await db.payment.create({
            data: {
              userId: user.id,
              stripePaymentId: invoice.payment_intent as string || "failed",
              amount: invoice.amount_due,
              currency: invoice.currency,
              status: "failed",
              description: `Failed payment for subscription`,
              metadata: {
                invoiceId: invoice.id,
                error: invoice.last_finalization_error?.message || "Unknown error",
              },
            },
          });

          console.log("Payment failed:", invoice.id);
        }
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
