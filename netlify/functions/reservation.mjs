/**
 * POST /api/reservation
 *
 * Reçoit les données du formulaire, vérifie la disponibilité côté serveur,
 * crée la réservation dans Sanity et initie un Payment Intent Stripe.
 *
 * Variables d'environnement requises :
 *   SANITY_PROJECT_ID
 *   SANITY_DATASET
 *   SANITY_WRITE_TOKEN
 *   STRIPE_SECRET_KEY
 */

import { createClient } from "@sanity/client";
import Stripe from "stripe";

// ─── Clients ──────────────────────────────────────────────────────────────────

const sanity = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset:   process.env.SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  token:     process.env.SANITY_WRITE_TOKEN,
  useCdn:    false,
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const json = (statusCode, body) => ({
  statusCode,
  headers: { ...CORS, "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const nbNuits = (arrivee, depart) => {
  const a = new Date(arrivee);
  const d = new Date(depart);
  return Math.round((d - a) / 86_400_000);
};

// ─── Validation ───────────────────────────────────────────────────────────────

function valider(data) {
  const champs = ["logementId", "arrivee", "depart", "adultes", "prenom", "nom", "email"];
  for (const c of champs) {
    if (!data[c]) return `Champ manquant : ${c}`;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return "Email invalide";
  if (new Date(data.arrivee) >= new Date(data.depart))  return "Dates invalides";
  if (nbNuits(data.arrivee, data.depart) <= 0)          return "Durée de séjour invalide";
  return null;
}

// ─── Vérification disponibilité (côté serveur) ────────────────────────────────

async function verifierDispo(logementId, arrivee, depart) {
  const [reservations, blocages] = await Promise.all([
    sanity.fetch(
      `*[_type == "reservation"
        && logement._ref == $logementId
        && statut in ["confirmee", "demande"]
        && dateArrivee < $depart
        && dateDepart  > $arrivee
      ]._id`,
      { logementId, arrivee, depart }
    ),
    sanity.fetch(
      `*[_type == "blocage"
        && logement._ref == $logementId
        && dateDebut < $depart
        && dateFin   > $arrivee
      ]._id`,
      { logementId, arrivee, depart }
    ),
  ]);

  return reservations.length === 0 && blocages.length === 0;
}

// ─── Tarif applicable ─────────────────────────────────────────────────────────

async function getTarif(logementId, arrivee) {
  const tarifs = await sanity.fetch(
    `*[_type == "tarifSaison"
      && dateDebut <= $arrivee
      && dateFin   >= $arrivee
      && (!defined(logement) || logement._ref == $logementId)
    ] | order(priorite asc)`,
    { logementId, arrivee }
  );
  return tarifs[0] ?? null;
}

// ─── Calcul du prix ───────────────────────────────────────────────────────────

function calculerPrix(tarif, arrivee, depart, adultes, enfants) {
  const nuits = nbNuits(arrivee, depart);

  let prixNuits = 0;
  const d = new Date(arrivee);
  for (let i = 0; i < nuits; i++) {
    const jour = d.getDay();
    const weekend = (jour === 5 || jour === 6);
    prixNuits += (weekend && tarif.prixWeekend) ? tarif.prixWeekend : tarif.prixParNuit;
    d.setDate(d.getDate() + 1);
  }

  const menage = tarif.fraisMenage ?? 0;
  const taxe   = (tarif.taxeSejour ?? 0) * (adultes + enfants) * nuits;
  const total  = prixNuits + menage + taxe;
  const pct    = tarif.acomptePercent ?? 30;
  const acompte = Math.ceil(total * pct / 100);

  return { nuits, prixNuits, menage, taxe, total, acompte, acomptePercent: pct };
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return json(200, {});
  if (event.httpMethod !== "POST")    return json(405, { error: "Méthode non autorisée" });

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return json(400, { error: "Corps de requête invalide" });
  }

  // Validation
  const errValidation = valider(data);
  if (errValidation) return json(400, { error: errValidation });

  const { logementId, arrivee, depart, adultes, enfants = 0,
          prenom, nom, email, telephone, pays, message,
          montantTotal, montantAcompte } = data;

  // Vérification dispo (double-check serveur)
  const dispo = await verifierDispo(logementId, arrivee, depart);
  if (!dispo) {
    return json(409, { error: "Ces dates ne sont plus disponibles." });
  }

  // Calcul du prix
  const tarif = await getTarif(logementId, arrivee);
  let prix = null;

  if (tarif) {
    prix = calculerPrix(tarif, arrivee, depart, Number(adultes), Number(enfants));
  } else if (montantTotal && montantAcompte) {
    // Fallback : montants envoyés par le front si pas de tarif configuré
    prix = {
      total:   montantTotal,
      acompte: montantAcompte,
      acomptePercent: Math.round(montantAcompte / montantTotal * 100),
    };
  }

  // Création de la réservation dans Sanity (statut "demande")
  let reservation;
  try {
    reservation = await sanity.create({
      _type:     "reservation",
      logement:  { _type: "reference", _ref: logementId },
      dateArrivee: arrivee,
      dateDepart:  depart,
      nbAdultes:   Number(adultes),
      nbEnfants:   Number(enfants),
      nbNuits:     nbNuits(arrivee, depart),
      prenom,
      nom,
      email,
      telephone:   telephone ?? "",
      pays:        pays ?? "",
      messageClient: message ?? "",
      montantTotal:   prix?.total   ?? null,
      montantAcompte: prix?.acompte ?? null,
      statutPaiement: "en_attente",
      statut:  "demande",
      source:  "site",
    });
  } catch (err) {
    console.error("[reservation] Sanity create error:", err);
    return json(500, { error: "Erreur lors de la création de la réservation." });
  }

  // Payment Intent Stripe (si montant connu)
  if (prix?.acompte) {
    try {
      const intent = await stripe.paymentIntents.create({
        amount:   Math.round(prix.acompte * 100), // en centimes
        currency: "eur",
        metadata: {
          reservationId: reservation._id,
          logementId,
          arrivee,
          depart,
          client: `${prenom} ${nom}`,
          email,
        },
        receipt_email: email,
        description:   `Acompte séjour ${arrivee} → ${depart} — ${prenom} ${nom}`,
      });

      // Enregistre l'ID Stripe dans Sanity
      await sanity.patch(reservation._id).set({
        stripePaymentIntentId: intent.id,
      }).commit();

      return json(200, {
        reservationId: reservation._id,
        clientSecret:  intent.client_secret,
        montantAcompte: prix.acompte,
        montantTotal:   prix.total,
      });

    } catch (err) {
      console.error("[reservation] Stripe error:", err);
      // On renvoie quand même le reservationId pour ne pas perdre la réservation
      return json(200, {
        reservationId: reservation._id,
        clientSecret:  null,
        warning: "Paiement non initialisé — contactez-nous pour finaliser.",
      });
    }
  }

  // Pas de montant → réservation créée, paiement à confirmer manuellement
  return json(200, {
    reservationId: reservation._id,
    clientSecret:  null,
  });
};
