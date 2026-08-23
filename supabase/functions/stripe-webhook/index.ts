// ====================================================================
// STRIPE WEBHOOK — SUPABASE EDGE FUNCTION
// "Uno paga, dos usan" couple entitlement synchronization
// ====================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.14.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";

serve(async (req: Request) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature || !endpointSecret) {
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const coupleId = session.metadata?.couple_id;
        const ownerUserId = session.client_reference_id;

        if (!coupleId) {
          console.warn("No couple_id metadata found on checkout session:", session.id);
          break;
        }

        // Upsert subscription record
        await supabase.from("subscriptions").upsert({
          couple_id: coupleId,
          subscription_owner_id: ownerUserId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          status: "active",
          price_id: session.line_items?.data?.[0]?.price?.id || null,
          updated_at: new Date().toISOString()
        });

        // Activate premium for both members of the couple in couple_keys & profiles
        const { data: couple } = await supabase
          .from("couple_keys")
          .select("user1_id, user2_id")
          .eq("couple_id", coupleId)
          .single();

        if (couple) {
          await supabase
            .from("profiles")
            .update({
              subscription_status: "active",
              subscription_owner_id: ownerUserId
            })
            .in("id", [couple.user1_id, couple.user2_id]);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const coupleId = subscription.metadata?.couple_id;
        const status = subscription.status === "active" ? "active" : subscription.status === "past_due" ? "past_due" : "canceled";

        if (coupleId) {
          await supabase
            .from("subscriptions")
            .update({
              status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq("couple_id", coupleId);

          const { data: couple } = await supabase
            .from("couple_keys")
            .select("user1_id, user2_id")
            .eq("couple_id", coupleId)
            .single();

          if (couple) {
            await supabase
              .from("profiles")
              .update({ subscription_status: status })
              .in("id", [couple.user1_id, couple.user2_id]);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const coupleId = subscription.metadata?.couple_id;

        if (coupleId) {
          await supabase
            .from("subscriptions")
            .update({
              status: "canceled",
              updated_at: new Date().toISOString()
            })
            .eq("couple_id", coupleId);

          const { data: couple } = await supabase
            .from("couple_keys")
            .select("user1_id, user2_id")
            .eq("couple_id", coupleId)
            .single();

          if (couple) {
            await supabase
              .from("profiles")
              .update({ subscription_status: "free" })
              .in("id", [couple.user1_id, couple.user2_id]);
          }
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});
