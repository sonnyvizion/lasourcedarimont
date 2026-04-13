import "./style.css";
import "./nav.css";
import "./reservation.css";
import "./nav-lang-globe.js";
import { client } from "./sanity.js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
let stripeElements = null;
let stripe         = null;

// ─────────────────────────────────────────────
// État global du formulaire
// ─────────────────────────────────────────────
const state = {
  currentStep: 1,
  logements: [],          // liste chargée depuis Sanity
  logementId: null,
  logementNom: null,
  logementMaxPersonnes: null,
  arrivee: null,          // string YYYY-MM-DD
  depart: null,
  adultes: 2,
  enfants: 0,
  tarif: null,            // tarifSaison applicable
  prix: null,             // { nuits, menage, taxe, total, acompte, solde, acomptePercent }
  disponible: false,
  // étape 2
  prenom: "",
  nom: "",
  email: "",
  telephone: "",
  pays: "BE",
  message: "",
};

// ─────────────────────────────────────────────
// Refs DOM
// ─────────────────────────────────────────────
const selLogement  = document.getElementById("resa-logement");
const inpArrivee   = document.getElementById("resa-arrivee");
const inpDepart    = document.getElementById("resa-depart");
const inpAdultes   = document.getElementById("resa-adultes");
const inpEnfants   = document.getElementById("resa-enfants");
const dispoResult  = document.querySelector("[data-dispo-result]");
const dispoStatus  = document.querySelector("[data-dispo-status]");
const dispoPrice   = document.querySelector("[data-dispo-price]");
const dispoUnavail = document.querySelector("[data-dispo-unavailable]");
const nextBtn1     = document.querySelector("[data-next-step='2']");
const recap        = document.querySelector("[data-recap]");
const acompteDisplay = document.querySelector("[data-acompte-display]");
const submitBtn    = document.querySelector("[data-submit]");
const submitError  = document.querySelector("[data-submit-error]");

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const fmt = (iso) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const fmtEur = (n) =>
  n != null ? `${Math.round(n).toLocaleString("fr-BE")} €` : "—";

const nbNuits = (arrivee, depart) => {
  if (!arrivee || !depart) return 0;
  const a = new Date(arrivee);
  const d = new Date(depart);
  return Math.round((d - a) / 86_400_000);
};

const jourSemaine = (iso) => {
  const jours = ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
  return jours[new Date(iso).getDay()];
};

// ─────────────────────────────────────────────
// Chargement des logements depuis Sanity
// ─────────────────────────────────────────────
async function chargerLogements() {
  try {
    // Quand le schema logement sera déployé avec le bon champ capaciteMax
    const docs = await client.fetch(
      `*[_type == "logement" && defined(slug)] | order(order asc) {
        _id,
        "nom": coalesce(nom[_key == "fr"][0].value, nom),
        "slug": slug.current,
        capaciteMax
      }`
    );
    state.logements = docs;
    selLogement.innerHTML = `<option value="">— Choisir un hébergement —</option>` +
      docs.map(l => `<option value="${l._id}" data-max="${l.capaciteMax ?? 99}">${l.nom}</option>`).join("");
  } catch {
    selLogement.innerHTML = `<option value="">Erreur de chargement</option>`;
  }
}

// ─────────────────────────────────────────────
// Vérification de disponibilité (GROQ)
// ─────────────────────────────────────────────
async function verifierDispo() {
  const { logementId, arrivee, depart } = state;
  if (!logementId || !arrivee || !depart) return false;

  // Un document chevauche si : dateDebut < depart ET dateFin > arrivee
  const reservations = await client.fetch(
    `*[_type == "reservation"
      && references($logementId)
      && statut in ["confirmee", "demande"]
      && dateArrivee < $depart
      && dateDepart > $arrivee
    ]._id`,
    { logementId, arrivee, depart }
  );

  const blocages = await client.fetch(
    `*[_type == "blocage"
      && references($logementId)
      && dateDebut < $depart
      && dateFin > $arrivee
    ]._id`,
    { logementId, arrivee, depart }
  );

  return reservations.length === 0 && blocages.length === 0;
}

// ─────────────────────────────────────────────
// Calcul du tarif applicable
// ─────────────────────────────────────────────
async function calculerTarif() {
  const { logementId, arrivee } = state;
  if (!logementId || !arrivee) return null;

  // On cherche le tarif le plus prioritaire couvrant la date d'arrivée
  // soit spécifique au logement, soit global (sans logement)
  const tarifs = await client.fetch(
    `*[_type == "tarifSaison"
      && dateDebut <= $arrivee
      && dateFin >= $arrivee
      && (!defined(logement) || logement._ref == $logementId)
    ] | order(priorite asc)`,
    { arrivee, logementId }
  );

  return tarifs[0] ?? null;
}

// ─────────────────────────────────────────────
// Calcul du prix total
// ─────────────────────────────────────────────
function calculerPrix(tarif, arrivee, depart, adultes, enfants) {
  if (!tarif) return null;
  const nuits = nbNuits(arrivee, depart);
  if (nuits <= 0) return null;

  let prixNuits = 0;
  // Calcul nuit par nuit pour gérer le tarif week-end
  const d = new Date(arrivee);
  for (let i = 0; i < nuits; i++) {
    const jour = d.getDay(); // 5=vendredi, 6=samedi
    const estWeekend = (jour === 5 || jour === 6);
    prixNuits += (estWeekend && tarif.prixWeekend) ? tarif.prixWeekend : tarif.prixParNuit;
    d.setDate(d.getDate() + 1);
  }

  const menage = tarif.fraisMenage ?? 0;
  const taxe   = (tarif.taxeSejour ?? 0) * (adultes + enfants) * nuits;
  const total  = prixNuits + menage + taxe;
  const pct    = tarif.acomptePercent ?? 30;
  const acompte = Math.ceil(total * pct / 100);
  const solde  = total - acompte;

  return { nuits, prixNuits, menage, taxe, total, acompte, solde, acomptePercent: pct };
}

// ─────────────────────────────────────────────
// Mise à jour de l'interface dispo + prix
// ─────────────────────────────────────────────
async function mettreAJourDispo() {
  const { arrivee, depart, logementId, adultes, enfants } = state;

  dispoResult.hidden  = true;
  dispoUnavail.hidden = true;
  nextBtn1.disabled   = true;
  state.disponible    = false;
  state.prix          = null;

  if (!logementId || !arrivee || !depart || nbNuits(arrivee, depart) <= 0) {
    mettreAJourSummary();
    return;
  }

  dispoStatus.textContent = "Vérification des disponibilités…";
  dispoResult.hidden = false;
  dispoPrice.textContent = "";

  try {
    const [dispo, tarif] = await Promise.all([
      verifierDispo(),
      calculerTarif(),
    ]);

    if (!dispo) {
      dispoResult.hidden  = true;
      dispoUnavail.hidden = false;
      mettreAJourSummary();
      return;
    }

    state.disponible = true;
    state.tarif = tarif;
    const prix = calculerPrix(tarif, arrivee, depart, adultes, enfants);
    state.prix = prix;

    dispoStatus.textContent = "✓ Disponible";
    dispoStatus.className   = "resa-dispo-status resa-dispo-status--ok";

    if (prix) {
      const nuits = nbNuits(arrivee, depart);
      dispoPrice.innerHTML =
        `<strong>${fmtEur(prix.total)}</strong> total · ${nuits} nuit${nuits > 1 ? "s" : ""} · acompte ${fmtEur(prix.acompte)}`;
    } else {
      dispoPrice.textContent = "Tarif non configuré — nous vous confirmons le montant.";
    }

    nextBtn1.disabled = false;
  } catch (e) {
    dispoStatus.textContent = "Erreur lors de la vérification. Réessayez.";
    dispoStatus.className   = "resa-dispo-status resa-dispo-status--error";
  }

  mettreAJourSummary();
}

// ─────────────────────────────────────────────
// Mise à jour de la colonne résumé
// ─────────────────────────────────────────────
function mettreAJourSummary() {
  const { arrivee, depart, logementNom, adultes, enfants, prix } = state;
  const nuits = nbNuits(arrivee, depart);

  const set = (attr, val) => {
    const el = document.querySelector(`[data-val="${attr}"]`);
    if (el) el.textContent = val ?? "—";
  };

  set("logement", logementNom);
  set("arrivee",  fmt(arrivee));
  set("depart",   fmt(depart));
  set("nuits",    nuits > 0 ? `${nuits} nuit${nuits > 1 ? "s" : ""}` : "—");
  set("voyageurs", adultes || enfants ? `${adultes} adulte${adultes > 1 ? "s" : ""}${enfants ? `, ${enfants} enfant${enfants > 1 ? "s" : ""}` : ""}` : "—");

  if (prix) {
    set("prix-nuits",  fmtEur(prix.prixNuits));
    set("prix-menage", prix.menage > 0 ? fmtEur(prix.menage) : "Inclus");
    set("prix-taxe",   prix.taxe   > 0 ? fmtEur(prix.taxe)   : null);
    set("total",   fmtEur(prix.total));
    set("acompte", fmtEur(prix.acompte));
    set("solde",   fmtEur(prix.solde));

    const acompteRow = document.querySelector(".resa-summary-acompte .resa-summary-key");
    if (acompteRow) acompteRow.textContent = `Acompte (${prix.acomptePercent}%)`;
  } else {
    ["prix-nuits","prix-menage","prix-taxe","total","acompte","solde"].forEach(k => set(k, null));
  }
}

// ─────────────────────────────────────────────
// Récapitulatif étape 3
// ─────────────────────────────────────────────
function remplirRecap() {
  const { prenom, nom, email, telephone, logementNom, arrivee, depart, adultes, enfants, prix } = state;
  const nuits = nbNuits(arrivee, depart);

  if (!recap) return;

  recap.innerHTML = `
    <div class="resa-recap-section">
      <div class="resa-recap-label">Hébergement</div>
      <div class="resa-recap-val">${logementNom ?? "—"}</div>
    </div>
    <div class="resa-recap-section">
      <div class="resa-recap-label">Dates</div>
      <div class="resa-recap-val">${fmt(arrivee)} → ${fmt(depart)} (${nuits} nuit${nuits > 1 ? "s" : ""})</div>
    </div>
    <div class="resa-recap-section">
      <div class="resa-recap-label">Voyageurs</div>
      <div class="resa-recap-val">${adultes} adulte${adultes > 1 ? "s" : ""}${enfants ? `, ${enfants} enfant${enfants > 1 ? "s" : ""}` : ""}</div>
    </div>
    <div class="resa-recap-section">
      <div class="resa-recap-label">Contact</div>
      <div class="resa-recap-val">${prenom} ${nom}<br/>${email}${telephone ? `<br/>${telephone}` : ""}</div>
    </div>
    ${prix ? `
    <div class="resa-recap-section">
      <div class="resa-recap-label">Montant total</div>
      <div class="resa-recap-val resa-recap-prix">${fmtEur(prix.total)}</div>
    </div>
    ` : ""}
  `;

  if (acompteDisplay && prix) {
    acompteDisplay.textContent = fmtEur(prix.acompte);
  }
}

// ─────────────────────────────────────────────
// Navigation entre étapes
// ─────────────────────────────────────────────
function allerEtape(n) {
  document.querySelectorAll(".resa-panel").forEach(p => {
    p.hidden = true;
    p.classList.remove("is-active");
  });
  document.querySelectorAll(".resa-step").forEach(s => {
    const num = parseInt(s.dataset.step);
    s.classList.toggle("is-active",  num === n);
    s.classList.toggle("is-done",    num < n);
  });

  const panel = document.querySelector(`[data-panel="${n}"]`);
  if (panel) {
    panel.hidden = false;
    panel.classList.add("is-active");
  }

  state.currentStep = n;
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (n === 3) {
    remplirRecap();
    monterStripeElements();
  }
}

// ─────────────────────────────────────────────
// Soumission (placeholder → serverless function)
// ─────────────────────────────────────────────
async function soumettre() {
  const cgv = document.getElementById("resa-cgv");
  if (!cgv?.checked) {
    afficherErreur("Veuillez accepter les conditions générales.");
    return;
  }

  const label  = submitBtn.querySelector(".resa-submit-label");
  const loader = submitBtn.querySelector(".resa-submit-loading");
  label.hidden  = true;
  loader.hidden = false;
  submitBtn.disabled = true;
  submitError.hidden = true;

  try {
    // TODO: remplacer par l'appel à la fonction serverless (Netlify/Vercel)
    // qui créera la réservation dans Sanity et initiera le Payment Intent Stripe
    const payload = {
      logementId:   state.logementId,
      arrivee:      state.arrivee,
      depart:       state.depart,
      adultes:      state.adultes,
      enfants:      state.enfants,
      prenom:       state.prenom,
      nom:          state.nom,
      email:        state.email,
      telephone:    state.telephone,
      pays:         state.pays,
      message:      state.message,
      montantTotal: state.prix?.total ?? null,
      montantAcompte: state.prix?.acompte ?? null,
    };

    // Appel à la fonction serverless
    const response = await fetch("/api/reservation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error ?? `Erreur ${response.status}`);
    }

    // Si Stripe a un clientSecret → on confirme le paiement
    if (result.clientSecret && stripe) {
      const { error: stripeError } = await stripe.confirmPayment({
        elements: stripeElements,
        clientSecret: result.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/reservation-confirmee.html?id=${result.reservationId}`,
          receipt_email: state.email,
        },
        redirect: "if_required",
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    }

    allerEtape("success");

  } catch (err) {
    afficherErreur("Une erreur est survenue. Veuillez réessayer ou nous contacter directement.");
    console.error(err);
  } finally {
    label.hidden  = false;
    loader.hidden = true;
    submitBtn.disabled = false;
  }
}

// ─────────────────────────────────────────────
// Stripe Elements
// ─────────────────────────────────────────────
async function monterStripeElements() {
  const container = document.getElementById("stripe-payment-element");
  if (!container || !state.prix?.acompte) return;

  stripe = await stripePromise;
  if (!stripe) return; // clé publique non configurée

  // On crée un Payment Intent minimal côté client pour afficher le formulaire
  // Note : le vrai Payment Intent est créé à la soumission dans soumettre()
  // Ici on monte juste l'UI Stripe en mode "amount placeholder"
  stripeElements = stripe.elements({
    mode:     "payment",
    amount:   Math.round(state.prix.acompte * 100),
    currency: "eur",
    appearance: {
      theme: "flat",
      variables: {
        colorPrimary:    "#2a5843",
        colorBackground: "#ffffff",
        colorText:       "#183528",
        borderRadius:    "10px",
        fontFamily:      "Manrope, sans-serif",
      },
    },
  });

  const paymentEl = stripeElements.create("payment");
  container.innerHTML = "";
  paymentEl.mount(container);
}

function afficherErreur(msg) {
  submitError.textContent = msg;
  submitError.hidden = false;
}

// ─────────────────────────────────────────────
// Événements
// ─────────────────────────────────────────────

// Sélection logement
selLogement?.addEventListener("change", () => {
  const opt = selLogement.options[selLogement.selectedIndex];
  state.logementId  = selLogement.value || null;
  state.logementNom = selLogement.value ? opt.text : null;
  state.logementMaxPersonnes = parseInt(opt.dataset.max) || null;
  mettreAJourDispo();
});

// Dates
inpArrivee?.addEventListener("change", () => {
  state.arrivee = inpArrivee.value || null;
  // Départ min = arrivée + 1
  if (state.arrivee) {
    const minDepart = new Date(state.arrivee);
    minDepart.setDate(minDepart.getDate() + 1);
    inpDepart.min = minDepart.toISOString().slice(0, 10);
    if (state.depart && state.depart <= state.arrivee) {
      inpDepart.value = inpDepart.min;
      state.depart = inpDepart.min;
    }
  }
  mettreAJourDispo();
});

inpDepart?.addEventListener("change", () => {
  state.depart = inpDepart.value || null;
  mettreAJourDispo();
});

// Compteurs voyageurs
document.querySelectorAll("[data-counter-inc]").forEach(btn => {
  btn.addEventListener("click", () => {
    const field = btn.dataset.counterInc;
    const inp   = document.getElementById(`resa-${field}`);
    const max   = parseInt(inp.max);
    const val   = parseInt(inp.value);
    if (val < max) { inp.value = val + 1; state[field] = val + 1; mettreAJourDispo(); }
  });
});

document.querySelectorAll("[data-counter-dec]").forEach(btn => {
  btn.addEventListener("click", () => {
    const field = btn.dataset.counterDec;
    const inp   = document.getElementById(`resa-${field}`);
    const min   = parseInt(inp.min);
    const val   = parseInt(inp.value);
    if (val > min) { inp.value = val - 1; state[field] = val - 1; mettreAJourDispo(); }
  });
});

// Navigation étapes
document.querySelectorAll("[data-next-step]").forEach(btn => {
  btn.addEventListener("click", () => {
    const cible = parseInt(btn.dataset.nextStep);
    // Validation étape 2
    if (cible === 3) {
      const prenom = document.getElementById("resa-prenom").value.trim();
      const nom    = document.getElementById("resa-nom").value.trim();
      const email  = document.getElementById("resa-email").value.trim();
      if (!prenom || !nom || !email) return;
      state.prenom    = prenom;
      state.nom       = nom;
      state.email     = email;
      state.telephone = document.getElementById("resa-telephone").value.trim();
      state.pays      = document.getElementById("resa-pays").value;
      state.message   = document.getElementById("resa-message").value.trim();
    }
    allerEtape(cible);
  });
});

document.querySelectorAll("[data-prev-step]").forEach(btn => {
  btn.addEventListener("click", () => allerEtape(parseInt(btn.dataset.prevStep)));
});

// Soumission
submitBtn?.addEventListener("click", soumettre);

// Année footer
const yearEl = document.querySelector("[data-year]");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Date min arrivée = aujourd'hui
const today = new Date().toISOString().slice(0, 10);
if (inpArrivee) inpArrivee.min = today;

// ─────────────────────────────────────────────
// Init
// ─────────────────────────────────────────────
chargerLogements();
mettreAJourSummary();
