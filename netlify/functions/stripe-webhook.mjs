/**
 * POST /api/stripe-webhook
 *
 * Appelé par Stripe quand un paiement est confirmé ou échoué.
 * Met à jour le statut de la réservation dans Sanity.
 *
 * Variables d'environnement requises :
 *   STRIPE_SECRET_KEY
 *   STRIPE_WEBHOOK_SECRET   ← obtenu dans le dashboard Stripe
 *   SANITY_PROJECT_ID
 *   SANITY_DATASET
 *   SANITY_WRITE_TOKEN
 */

import { createClient } from "@sanity/client";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const sanity = createClient({
  projectId:  process.env.SANITY_PROJECT_ID,
  dataset:    process.env.SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  token:      process.env.SANITY_WRITE_TOKEN,
  useCdn:     false,
});

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const sig     = event.headers["stripe-signature"];
  const secret  = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, secret);
  } catch (err) {
    console.error("[stripe-webhook] Signature invalide :", err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  const intent = stripeEvent.data.object;

  switch (stripeEvent.type) {

    case "payment_intent.succeeded": {
      const reservationId = intent.metadata?.reservationId;
      if (!reservationId) break;

      await sanity.patch(reservationId).set({
        statutPaiement: "acompte_paye",
        statut:         "confirmee",
      }).commit();

      console.log(`[stripe-webhook] Réservation ${reservationId} confirmée.`);
      break;
    }

    case "payment_intent.payment_failed": {
      const reservationId = intent.metadata?.reservationId;
      if (!reservationId) break;

      await sanity.patch(reservationId).set({
        statutPaiement: "en_attente",
        noteInterne:    `Paiement échoué le ${new Date().toISOString()} — ${intent.last_payment_error?.message ?? "raison inconnue"}`,
      }).commit();

      console.warn(`[stripe-webhook] Paiement échoué pour ${reservationId}.`);
      break;
    }

    default:
      // Événement non géré — on ignore
      break;
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
