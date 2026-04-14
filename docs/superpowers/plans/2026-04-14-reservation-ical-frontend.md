# Système de réservation — Plan B : iCal + Crons + Frontend

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter la sync iCal bidirectionnelle avec Booking.com, le cron d'expiration des demandes, l'email de rappel pré-arrivée, et finaliser la page de réservation (`reservation.html`) ainsi que la page de confirmation.

**Architecture:** Ce plan est la suite directe du Plan A. Il suppose que les Netlify Functions core (reservation, webhook, confirmer, refuser, emails) sont déjà en place et fonctionnelles.

**Tech Stack:** node-ical (parsing iCal), @netlify/functions schedule, Stripe refunds, vanilla JS

**Prérequis :** Plan A complété et déployé.

---

## Map des fichiers

### Créer
```
netlify/
  functions/
    lib/
      ical-sync.js            ← logique sync inbound Booking → Sanity
    ical.js                   ← GET /api/ical/:logementId (outbound)
    sync-ical.js              ← Cron 30min : sync inbound tous logements
    sync-expirations.js       ← Cron 30min : rappels + remboursements auto
confirmation.html             ← page de confirmation post-paiement
src/
  confirmation.js
  confirmation.css
```

### Modifier
```
src/reservation.js            ← câbler Stripe Payment Element correctement
                                 (étape 4 distincte, confirmation.html)
src/reservation.css           ← polish visuel si nécessaire
```

---

## Task 1 : iCal outbound — GET /api/ical/:logementId

**Files:**
- Create: `netlify/functions/ical.js`

Ce endpoint génère un flux iCal valide à partir des réservations confirmées et des blocages d'un logement. Booking.com le consomme pour bloquer les dates côté leur plateforme.

- [ ] **Step 1 : Créer netlify/functions/ical.js**

```js
// netlify/functions/ical.js
import { sanity } from './lib/sanity.js'

export const handler = async (event) => {
  // Le logementId est dans le path : /api/ical/LOGEMENT_ID
  const segments = event.path.split('/')
  const logementId = segments[segments.length - 1]

  if (!logementId) {
    return { statusCode: 400, body: 'logementId manquant' }
  }

  let reservations, blocages
  try {
    ;[reservations, blocages] = await Promise.all([
      sanity.fetch(
        `*[_type == "reservation"
          && logement._ref == $logementId
          && statut in ["confirmee", "demande"]
        ]{
          _id, dateArrivee, dateDepart,
          "nomClient": client.nom,
          source
        }`,
        { logementId }
      ),
      sanity.fetch(
        `*[_type == "blocage" && logement._ref == $logementId]{
          _id, dateDebut, dateFin, icalUid, source
        }`,
        { logementId }
      ),
    ])
  } catch (e) {
    console.error('Sanity fetch error (ical):', e)
    return { statusCode: 500, body: 'Erreur serveur' }
  }

  const vevents = []

  // Réservations directes confirmées
  for (const r of reservations) {
    const uid = `${r._id}@lasourcedarimont.be`
    const summary = r.source === 'direct'
      ? (r.nomClient ? `${r.nomClient} — Réservation directe` : 'Réservation directe')
      : (r.nomClient ?? 'Réservation')
    vevents.push(vevent(uid, r.dateArrivee, r.dateDepart, summary))
  }

  // Blocages
  for (const b of blocages) {
    const uid = b.icalUid ?? `blocage-${b._id}@lasourcedarimont.be`
    vevents.push(vevent(uid, b.dateDebut, b.dateFin, 'Blocked'))
  }

  const ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Domaine de la Source d\'Arimont//Reservation//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...vevents,
    'END:VCALENDAR',
  ].join('\r\n')

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'no-cache, no-store',
    },
    body: ical,
  }
}

/** Formate une date ISO YYYY-MM-DD en YYYYMMDD pour iCal. */
function isoToIcal(iso) {
  return iso.replace(/-/g, '')
}

function vevent(uid, dateDebut, dateFin, summary) {
  return [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTART;VALUE=DATE:${isoToIcal(dateDebut)}`,
    `DTEND;VALUE=DATE:${isoToIcal(dateFin)}`,
    `SUMMARY:${summary}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15)}Z`,
    'END:VEVENT',
  ].join('\r\n')
}
```

- [ ] **Step 2 : Tester le endpoint manuellement**

```bash
# Netlify dev en route
curl http://localhost:8888/api/ical/<LOGEMENT_ID>
```

Expected :
```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Domaine de la Source d'Arimont//Reservation//FR
...
BEGIN:VEVENT
UID:...@lasourcedarimont.be
DTSTART;VALUE=DATE:20260901
DTEND;VALUE=DATE:20260905
SUMMARY:Alice Dupont — Réservation directe
...
END:VEVENT
END:VCALENDAR
```

Valider avec [ical validator](https://icalendar.org/validator.html) si disponible.

- [ ] **Step 3 : Commit**

```bash
git add netlify/functions/ical.js
git commit -m "feat: endpoint iCal outbound GET /api/ical/:logementId"
```

---

## Task 2 : TDD — Lib sync iCal inbound

**Files:**
- Create: `netlify/functions/lib/ical-sync.js`
- Create: `tests/ical-sync.test.js`

- [ ] **Step 1 : Écrire les tests**

```js
// tests/ical-sync.test.js
import { describe, it, expect } from 'vitest'
import { classifierEvenement, isoFromIcal } from '../netlify/functions/lib/ical-sync.js'

describe('classifierEvenement', () => {
  it('retourne "blocage" si summary vide', () => {
    expect(classifierEvenement('')).toBe('blocage')
    expect(classifierEvenement(null)).toBe('blocage')
    expect(classifierEvenement(undefined)).toBe('blocage')
  })

  it('retourne "blocage" si summary contient un mot-clé bloquant', () => {
    expect(classifierEvenement('CLOSED')).toBe('blocage')
    expect(classifierEvenement('Blocked')).toBe('blocage')
    expect(classifierEvenement('Not available')).toBe('blocage')
    expect(classifierEvenement('Unavailable')).toBe('blocage')
    expect(classifierEvenement('Indisponible')).toBe('blocage')
  })

  it('retourne "reservation" si summary ressemble à un nom (≥2 mots)', () => {
    expect(classifierEvenement('John Smith')).toBe('reservation')
    expect(classifierEvenement('Marie Van den Berg')).toBe('reservation')
  })

  it('retourne "blocage" si summary est un seul mot non bloquant', () => {
    expect(classifierEvenement('Occupé')).toBe('blocage')
  })
})

describe('isoFromIcal', () => {
  it('convertit YYYYMMDD en YYYY-MM-DD', () => {
    expect(isoFromIcal('20260601')).toBe('2026-06-01')
  })

  it('retourne null si valeur invalide', () => {
    expect(isoFromIcal(null)).toBeNull()
    expect(isoFromIcal('')).toBeNull()
  })
})
```

- [ ] **Step 2 : Vérifier que les tests échouent**

```bash
npm test
```

Expected : FAIL — "Cannot find module"

- [ ] **Step 3 : Créer netlify/functions/lib/ical-sync.js**

```js
// netlify/functions/lib/ical-sync.js
import ical from 'node-ical'
import { sanity } from './sanity.js'

const MOTS_CLES_BLOCAGE = ['blocked', 'closed', 'unavailable', 'not available', 'indisponible']

/**
 * Classe un SUMMARY iCal en "reservation" ou "blocage".
 */
export function classifierEvenement(summary) {
  if (!summary || summary.trim() === '') return 'blocage'
  const lower = summary.toLowerCase()
  if (MOTS_CLES_BLOCAGE.some((m) => lower.includes(m))) return 'blocage'
  if (summary.trim().split(/\s+/).length >= 2) return 'reservation'
  return 'blocage'
}

/**
 * Convertit une date iCal (YYYYMMDD ou Date object) en ISO YYYY-MM-DD.
 */
export function isoFromIcal(val) {
  if (!val) return null
  if (val instanceof Date) {
    return val.toISOString().slice(0, 10)
  }
  if (typeof val === 'string' && val.length === 8) {
    return `${val.slice(0, 4)}-${val.slice(4, 6)}-${val.slice(6, 8)}`
  }
  return null
}

/**
 * Synchronise le flux iCal d'un logement depuis Booking.com vers Sanity.
 * - Crée ou met à jour les blocages/reservations selon l'UID.
 * - Supprime les entrées dont l'UID a disparu du flux (annulations Booking).
 *
 * @param {string} logementId  - _id Sanity du logement
 * @param {string} icalUrl     - URL du flux iCal Booking.com
 */
export async function syncLogement(logementId, icalUrl) {
  // 1. Fetch + parse le flux iCal
  let events
  try {
    const parsed = await ical.async.fromURL(icalUrl)
    events = Object.values(parsed).filter((e) => e.type === 'VEVENT')
  } catch (e) {
    console.error(`[sync-ical] Erreur fetch ${icalUrl}:`, e.message)
    return { ok: false, error: e.message }
  }

  const uidsVus = new Set()

  for (const event of events) {
    const uid = event.uid
    if (!uid) continue

    const dateDebut = isoFromIcal(event.start)
    const dateFin = isoFromIcal(event.end)
    if (!dateDebut || !dateFin) continue

    const summary = event.summary ?? ''
    const type = classifierEvenement(summary)
    uidsVus.add(uid)

    // Chercher un document existant avec cet UID pour ce logement
    const docType = type === 'reservation' ? 'reservation' : 'blocage'
    const existant = await sanity.fetch(
      `*[_type in ["reservation","blocage"] && icalUid == $uid && logement._ref == $logementId][0]`,
      { uid, logementId }
    )

    if (existant) {
      // Mettre à jour les dates si elles ont changé
      const champDebut = existant._type === 'blocage' ? 'dateDebut' : 'dateArrivee'
      const champFin = existant._type === 'blocage' ? 'dateFin' : 'dateDepart'
      if (existant[champDebut] !== dateDebut || existant[champFin] !== dateFin) {
        await sanity.patch(existant._id).set({ [champDebut]: dateDebut, [champFin]: dateFin }).commit()
      }
    } else {
      // Créer un nouveau document
      if (type === 'reservation') {
        await sanity.create({
          _type: 'reservation',
          logement: { _type: 'reference', _ref: logementId },
          source: 'booking.com',
          statut: 'confirmee',
          dateArrivee: dateDebut,
          dateDepart: dateFin,
          nbAdultes: 1,
          nbEnfants: 0,
          client: { nom: summary, email: '', telephone: '', pays: '', langue: 'fr' },
          icalUid: uid,
          creeA: new Date().toISOString(),
        })
      } else {
        await sanity.create({
          _type: 'blocage',
          logement: { _type: 'reference', _ref: logementId },
          source: 'booking.com',
          dateDebut,
          dateFin,
          icalUid: uid,
        })
      }
    }
  }

  // 3. Supprimer les entrées Booking.com dont l'UID a disparu (annulations)
  const anciensUids = await sanity.fetch(
    `*[_type in ["reservation","blocage"]
      && logement._ref == $logementId
      && source == "booking.com"
      && defined(icalUid)
    ]{ _id, icalUid }`,
    { logementId }
  )

  for (const doc of anciensUids) {
    if (!uidsVus.has(doc.icalUid)) {
      await sanity.delete(doc._id)
    }
  }

  return { ok: true, nbEvents: events.length }
}
```

- [ ] **Step 4 : Vérifier que les tests passent**

```bash
npm test
```

Expected : PASS — tous les tests tarification + disponibilite + ical-sync passent.

- [ ] **Step 5 : Commit**

```bash
git add netlify/functions/lib/ical-sync.js tests/ical-sync.test.js
git commit -m "feat: lib sync iCal inbound + tests (TDD)"
```

---

## Task 3 : Cron — sync iCal (toutes les 30min)

**Files:**
- Create: `netlify/functions/sync-ical.js`

- [ ] **Step 1 : Créer netlify/functions/sync-ical.js**

```js
// netlify/functions/sync-ical.js
import { schedule } from '@netlify/functions'
import { sanity } from './lib/sanity.js'
import { syncLogement } from './lib/ical-sync.js'

export const handler = schedule('*/30 * * * *', async () => {
  // Récupérer tous les logements actifs avec une URL iCal Booking.com
  const logements = await sanity.fetch(
    `*[_type == "logement" && actif == true && defined(icalUrlBooking)]{
      _id, nom, icalUrlBooking
    }`
  )

  console.log(`[sync-ical] ${logements.length} logements à synchroniser`)

  const resultats = await Promise.allSettled(
    logements.map((l) => syncLogement(l._id, l.icalUrlBooking))
  )

  for (let i = 0; i < logements.length; i++) {
    const r = resultats[i]
    if (r.status === 'fulfilled') {
      console.log(`[sync-ical] ${logements[i].nom}: ${r.value.nbEvents} événements`)
    } else {
      console.error(`[sync-ical] ${logements[i].nom}: ERREUR`, r.reason)
    }
  }

  return { statusCode: 200 }
})
```

- [ ] **Step 2 : Tester le cron manuellement**

```bash
# Netlify dev : les crons peuvent être déclenchés via l'URL interne
curl -X POST http://localhost:8888/.netlify/functions/sync-ical
```

Expected : log `[sync-ical] N logements à synchroniser` puis résultats par logement.

- [ ] **Step 3 : Commit**

```bash
git add netlify/functions/sync-ical.js
git commit -m "feat: cron sync iCal Booking.com → Sanity (30min)"
```

---

## Task 4 : Cron — expiration des demandes (rappel 2h + remboursement 24h)

**Files:**
- Create: `netlify/functions/sync-expirations.js`

- [ ] **Step 1 : Créer netlify/functions/sync-expirations.js**

```js
// netlify/functions/sync-expirations.js
import { schedule } from '@netlify/functions'
import Stripe from 'stripe'
import { sanity } from './lib/sanity.js'
import { sendEmail } from './lib/emails.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const RAPPEL_MS = 2 * 60 * 60 * 1000   // 2 heures
const EXPIRATION_MS = 24 * 60 * 60 * 1000 // 24 heures

export const handler = schedule('*/30 * * * *', async () => {
  const maintenant = Date.now()

  // Récupérer toutes les demandes non traitées
  const demandes = await sanity.fetch(
    `*[_type == "reservation" && statut == "demande"]{
      _id, creeA, rappelEnvoye, stripePaymentIntentId, tokenConfirmer, tokenRefuser,
      acompte, client,
      "logementNom": logement->nom,
      logement->{ nom }
    }`
  )

  console.log(`[sync-expirations] ${demandes.length} demandes en attente`)

  for (const resa of demandes) {
    const age = maintenant - new Date(resa.creeA).getTime()

    // ── Expiration : 24h sans action → remboursement + annulation ──────────
    if (age >= EXPIRATION_MS) {
      console.log(`[sync-expirations] Expiration résa ${resa._id}`)

      try {
        const refund = await stripe.refunds.create({
          payment_intent: resa.stripePaymentIntentId,
        })
        await sanity.patch(resa._id).set({
          statut: 'expiree',
          stripeRefundId: refund.id,
          tokenConfirmer: null,
          tokenRefuser: null,
        }).commit()
      } catch (e) {
        console.error(`Stripe refund error (expiration):`, e.message)
        await sanity.patch(resa._id).set({
          statut: 'expiree',
          tokenConfirmer: null,
          tokenRefuser: null,
        }).commit()
      }

      // Email client : demande expirée + remboursement
      try {
        await sendEmail('reservation-annulee', resa)
      } catch (e) {
        console.error('Email expiration error:', e.message)
      }

      continue
    }

    // ── Rappel : 2h sans action, rappel non encore envoyé ─────────────────
    if (age >= RAPPEL_MS && !resa.rappelEnvoye) {
      console.log(`[sync-expirations] Rappel propriétaire pour résa ${resa._id}`)

      const siteUrl = process.env.SITE_URL ?? ''
      try {
        // Réutilise le template "nouvelle-reservation" comme rappel
        await sendEmail('nouvelle-reservation', resa, { siteUrl })
        await sanity.patch(resa._id).set({ rappelEnvoye: true }).commit()
      } catch (e) {
        console.error('Email rappel error:', e.message)
      }
    }
  }

  return { statusCode: 200 }
})
```

- [ ] **Step 2 : Tester manuellement**

```bash
curl -X POST http://localhost:8888/.netlify/functions/sync-expirations
```

Expected : log `[sync-expirations] N demandes en attente` (0 si aucune demande en cours).

Pour tester le rappel : créer une résa en statut "demande" dans Sanity avec `creeA` = il y a 3h, `rappelEnvoye: false`. Relancer le cron et vérifier que l'email de rappel est envoyé.

- [ ] **Step 3 : Commit**

```bash
git add netlify/functions/sync-expirations.js
git commit -m "feat: cron expiration des demandes (rappel 2h + remboursement 24h)"
```

---

## Task 5 : Cron — Email pré-arrivée (7 jours avant)

**Files:**
- Modify: `netlify/functions/sync-expirations.js` → ajouter la logique pré-arrivée (dans le même cron)

> On ajoute la logique "avant-arrivée" dans le cron existant plutôt que de créer un 3e cron.

- [ ] **Step 1 : Ajouter la logique avant-arrivée dans sync-expirations.js**

Après la boucle sur les demandes, ajouter dans le handler :

```js
  // ── Email pré-arrivée : 7 jours avant ────────────────────────────────────

  const dans7Jours = new Date(maintenant + 7 * 24 * 60 * 60 * 1000)
    .toISOString().slice(0, 10) // YYYY-MM-DD

  const arriveesDans7Jours = await sanity.fetch(
    `*[_type == "reservation"
      && statut == "confirmee"
      && source == "direct"
      && dateArrivee == $date
    ]{
      _id, client, dateArrivee, dateDepart, nbAdultes, nbEnfants, solde,
      "logementNom": logement->nom,
      logement->{ nom, instructionsArrivee }
    }`,
    { date: dans7Jours }
  )

  // Charger les infos de la propriété (singleton)
  const infosPropriete = await sanity.fetch(
    `*[_type == "infosPropriete"][0]`
  )

  for (const resa of arriveesDans7Jours) {
    console.log(`[avant-arrivee] Email pour résa ${resa._id} (arrivée ${resa.dateArrivee})`)
    try {
      await sendEmail('avant-arrivee', resa, { jours: 7, infosPropriete })
    } catch (e) {
      console.error('Email avant-arrivee error:', e.message)
    }
  }
```

Le fichier `sync-expirations.js` complet avec cette addition :

```js
// netlify/functions/sync-expirations.js
import { schedule } from '@netlify/functions'
import Stripe from 'stripe'
import { sanity } from './lib/sanity.js'
import { sendEmail } from './lib/emails.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const RAPPEL_MS = 2 * 60 * 60 * 1000
const EXPIRATION_MS = 24 * 60 * 60 * 1000

export const handler = schedule('*/30 * * * *', async () => {
  const maintenant = Date.now()

  // ── Expirations + rappels ─────────────────────────────────────────────────

  const demandes = await sanity.fetch(
    `*[_type == "reservation" && statut == "demande"]{
      _id, creeA, rappelEnvoye, stripePaymentIntentId,
      acompte, client,
      "logementNom": logement->nom,
      logement->{ nom }
    }`
  )

  for (const resa of demandes) {
    const age = maintenant - new Date(resa.creeA).getTime()

    if (age >= EXPIRATION_MS) {
      try {
        const refund = await stripe.refunds.create({ payment_intent: resa.stripePaymentIntentId })
        await sanity.patch(resa._id).set({
          statut: 'expiree',
          stripeRefundId: refund.id,
          tokenConfirmer: null,
          tokenRefuser: null,
        }).commit()
      } catch (e) {
        console.error('Stripe refund error:', e.message)
        await sanity.patch(resa._id).set({
          statut: 'expiree',
          tokenConfirmer: null,
          tokenRefuser: null,
        }).commit()
      }
      try { await sendEmail('reservation-annulee', resa) } catch (e) {
        console.error('Email expiration:', e.message)
      }
      continue
    }

    if (age >= RAPPEL_MS && !resa.rappelEnvoye) {
      try {
        await sendEmail('nouvelle-reservation', resa, { siteUrl: process.env.SITE_URL ?? '' })
        await sanity.patch(resa._id).set({ rappelEnvoye: true }).commit()
      } catch (e) {
        console.error('Email rappel:', e.message)
      }
    }
  }

  // ── Email pré-arrivée (7 jours avant) ────────────────────────────────────

  const dans7Jours = new Date(maintenant + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const arrivees = await sanity.fetch(
    `*[_type == "reservation"
      && statut == "confirmee"
      && source == "direct"
      && dateArrivee == $date
    ]{
      _id, client, dateArrivee, dateDepart, nbAdultes, nbEnfants, solde,
      "logementNom": logement->nom,
      logement->{ nom, instructionsArrivee }
    }`,
    { date: dans7Jours }
  )

  const infosPropriete = await sanity.fetch(`*[_type == "infosPropriete"][0]`)

  for (const resa of arrivees) {
    try {
      await sendEmail('avant-arrivee', resa, { jours: 7, infosPropriete })
    } catch (e) {
      console.error('Email avant-arrivee:', e.message)
    }
  }

  return { statusCode: 200 }
})
```

- [ ] **Step 2 : Commit**

```bash
git add netlify/functions/sync-expirations.js
git commit -m "feat: email pré-arrivée 7 jours avant dans le cron sync-expirations"
```

---

## Task 6 : Page confirmation.html

**Files:**
- Create: `confirmation.html`
- Create: `src/confirmation.js`
- Modify: `vite.config.js`

Cette page est affichée après le paiement Stripe réussi. Elle récupère l'`id` depuis l'URL (`?id=RESA_ID`) et affiche un message de confirmation chaleureux.

- [ ] **Step 1 : Ajouter confirmation.html dans vite.config.js**

Dans `vite.config.js`, section `rollupOptions.input`, ajouter :
```js
confirmation: resolve(__dirname, 'confirmation.html'),
```

- [ ] **Step 2 : Créer confirmation.html**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Demande reçue — Domaine de la Source d'Arimont</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="/src/style.css">
  <link rel="stylesheet" href="/src/nav.css">
</head>
<body>
  <nav class="nav" id="nav" aria-label="Navigation principale">
    <!-- nav injectée par nav-lang-globe.js -->
  </nav>

  <main class="confirmation-main">
    <div class="confirmation-card" id="confirmation-card">
      <div class="confirmation-icon">✓</div>
      <h1 class="confirmation-titre">Demande reçue !</h1>
      <p class="confirmation-intro">
        Votre acompte a bien été encaissé. Vous allez recevoir un email de confirmation sous 1 heure.
      </p>
      <div class="confirmation-info" id="confirmation-info">
        <!-- rempli par confirmation.js -->
      </div>
      <a href="/" class="confirmation-cta">Retour à l'accueil</a>
    </div>
  </main>

  <script type="module" src="/src/confirmation.js"></script>
</body>
</html>
```

- [ ] **Step 3 : Créer src/confirmation.js**

```js
// src/confirmation.js
import './style.css'
import './nav.css'
import './nav-lang-globe.js'

const params = new URLSearchParams(window.location.search)
const reservationId = params.get('id')
const infoEl = document.getElementById('confirmation-info')

// Message d'action (confirmation/annulation) pour le propriétaire
const action = params.get('action')
if (action === 'confirmee') {
  const nom = decodeURIComponent(params.get('nom') ?? '')
  document.querySelector('.confirmation-titre').textContent = 'Réservation confirmée !'
  document.querySelector('.confirmation-intro').textContent =
    `La réservation${nom ? ` de ${nom}` : ''} a bien été confirmée. L'email de confirmation a été envoyé.`
  document.querySelector('.confirmation-icon').textContent = '✓'
} else if (action === 'annulee') {
  document.querySelector('.confirmation-titre').textContent = 'Demande refusée'
  document.querySelector('.confirmation-intro').textContent =
    'La demande a été refusée et le client remboursé automatiquement.'
  document.querySelector('.confirmation-icon').textContent = '✕'
  document.querySelector('.confirmation-icon').style.background = '#c0392b'
} else if (action === 'invalide') {
  document.querySelector('.confirmation-titre').textContent = 'Lien invalide'
  document.querySelector('.confirmation-intro').textContent =
    'Ce lien a déjà été utilisé ou est invalide.'
  document.querySelector('.confirmation-icon').textContent = '!'
  document.querySelector('.confirmation-icon').style.background = '#e67e22'
}

// Afficher l'ID de réservation si présent
if (reservationId && infoEl && !action) {
  infoEl.innerHTML = `
    <p style="font-size:14px;color:#6b7c6e;margin:0;">
      Référence de votre demande : <strong>${reservationId}</strong>
    </p>`
}
```

- [ ] **Step 4 : Ajouter styles dans src/confirmation.css et l'importer**

Créer `src/confirmation.css` :

```css
/* src/confirmation.css */
.confirmation-main {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: var(--color-bg, #f9f7f4);
}

.confirmation-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  padding: 48px 40px;
  max-width: 520px;
  width: 100%;
  text-align: center;
}

.confirmation-icon {
  width: 72px;
  height: 72px;
  background: #2a5843;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  margin: 0 auto 24px;
}

.confirmation-titre {
  font-size: 28px;
  color: #183528;
  margin: 0 0 16px;
}

.confirmation-intro {
  font-size: 16px;
  color: #4a5e50;
  line-height: 1.6;
  margin: 0 0 24px;
}

.confirmation-cta {
  display: inline-block;
  background: #2a5843;
  color: #fff;
  padding: 14px 32px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 15px;
  font-weight: 600;
  margin-top: 16px;
  transition: opacity 0.2s;
}

.confirmation-cta:hover {
  opacity: 0.9;
}

@media (max-width: 600px) {
  .confirmation-card { padding: 32px 20px; }
}
```

Ajouter dans `src/confirmation.js` en haut :
```js
import './confirmation.css'
```

- [ ] **Step 5 : Commit**

```bash
git add confirmation.html src/confirmation.js src/confirmation.css vite.config.js
git commit -m "feat: page confirmation.html post-paiement"
```

---

## Task 7 : Finalisation reservation.js — câblage Stripe étape 4

**Files:**
- Modify: `src/reservation.js`

L'objectif : corriger le flux de paiement pour qu'il appelle `/api/reservation` **lors du clic sur Payer**, pas avant. Le `clientSecret` est obtenu au moment du clic, puis `stripe.confirmPayment()` redirige vers `confirmation.html`.

- [ ] **Step 1 : Identifier la fonction `soumettre()` dans src/reservation.js**

Ouvrir `src/reservation.js` lignes ~346-419. La fonction `soumettre()` :
1. Appelle `/api/reservation` → obtient `clientSecret`
2. Monte les Stripe Elements avec ce `clientSecret`
3. Appelle `stripe.confirmPayment()`
4. Redirige vers `/reservation-confirmee.html` (à changer en `/confirmation.html`)

- [ ] **Step 2 : Corriger l'URL de redirection dans soumettre()**

Dans `src/reservation.js`, à la ligne ~396, remplacer :
```js
return_url: `${window.location.origin}/reservation-confirmee.html?id=${result.reservationId}`,
```
par :
```js
return_url: `${window.location.origin}/lasourcedarimont/confirmation.html?id=${result.reservationId}`,
```

- [ ] **Step 3 : Corriger le payload envoyé à /api/reservation**

Dans la fonction `soumettre()`, le payload doit correspondre exactement aux champs attendus par la Netlify Function. Remplacer la section `const payload = {...}` par :

```js
const payload = {
  logementId:     state.logementId,
  arrivee:        state.arrivee,
  depart:         state.depart,
  nbAdultes:      state.adultes,
  nbEnfants:      state.enfants,
  langue:         getCurrentLanguage?.() ?? 'fr',
  prenom:         state.prenom,
  nom:            state.nom,
  email:          state.email,
  telephone:      state.telephone ?? '',
  pays:           state.pays ?? 'BE',
  montantTotal:   state.prix?.total ?? null,
  montantAcompte: state.prix?.acompte ?? null,
}
```

Ajouter l'import de `getCurrentLanguage` en haut du fichier si pas déjà présent :
```js
import { getCurrentLanguage } from './i18n.js'
```

- [ ] **Step 4 : Vérifier que monterStripeElements() est appelé après obtention du clientSecret**

Dans la fonction `soumettre()`, après avoir obtenu `result.clientSecret`, s'assurer que les Stripe Elements sont montés avec ce `clientSecret` (pas en mode `amount placeholder`). La logique actuelle monte les Elements dans `allerEtape(3)` — le flux doit appeler `/api/reservation` d'abord pour obtenir le PI, puis monter les Elements avec le `clientSecret`.

Modifier `allerEtape()` pour que l'étape 3 (paiement) déclenche d'abord la création du PI :

```js
// Dans allerEtape(), remplacer le bloc `if (n === 3)` :
if (n === 3) {
  remplirRecap()
  // Créer le Payment Intent et monter les Elements avec le clientSecret
  await creerPaymentIntentEtMonterElements()
}
```

Et créer la nouvelle fonction :

```js
async function creerPaymentIntentEtMonterElements() {
  const container = document.getElementById('stripe-payment-element')
  if (!container || !state.prix?.acompte) return

  container.innerHTML = '<p style="color:#6b7c6e;font-size:14px;">Initialisation du paiement…</p>'
  submitBtn.disabled = true

  try {
    const response = await fetch('/api/reservation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        logementId:     state.logementId,
        arrivee:        state.arrivee,
        depart:         state.depart,
        nbAdultes:      state.adultes,
        nbEnfants:      state.enfants,
        langue:         getCurrentLanguage?.() ?? 'fr',
        prenom:         state.prenom,
        nom:            state.nom,
        email:          state.email,
        telephone:      state.telephone ?? '',
        pays:           state.pays ?? 'BE',
        montantTotal:   state.prix.total,
        montantAcompte: state.prix.acompte,
      }),
    })

    const result = await response.json()
    if (!response.ok) throw new Error(result.error ?? `Erreur ${response.status}`)

    state.reservationId = result.reservationId

    stripe = await stripePromise
    stripeElements = stripe.elements({
      clientSecret: result.clientSecret,
      appearance: {
        theme: 'flat',
        variables: {
          colorPrimary: '#2a5843',
          colorBackground: '#ffffff',
          colorText: '#183528',
          borderRadius: '10px',
          fontFamily: 'Manrope, sans-serif',
        },
      },
    })

    const paymentEl = stripeElements.create('payment')
    container.innerHTML = ''
    paymentEl.mount(container)
    submitBtn.disabled = false
  } catch (err) {
    container.innerHTML = `<p style="color:#c0392b;font-size:14px;">Erreur : ${err.message}</p>`
    afficherErreur('Erreur d\'initialisation du paiement. Veuillez réessayer.')
  }
}
```

Et simplifier `soumettre()` pour qu'il ne rappelle plus `/api/reservation` (déjà fait) :

```js
async function soumettre() {
  const cgv = document.getElementById('resa-cgv')
  if (!cgv?.checked) {
    afficherErreur('Veuillez accepter les conditions générales.')
    return
  }

  const label  = submitBtn.querySelector('.resa-submit-label')
  const loader = submitBtn.querySelector('.resa-submit-loading')
  label.hidden  = true
  loader.hidden = false
  submitBtn.disabled = true
  submitError.hidden = true

  try {
    const { error: stripeError } = await stripe.confirmPayment({
      elements: stripeElements,
      confirmParams: {
        return_url: `${window.location.origin}/lasourcedarimont/confirmation.html?id=${state.reservationId}`,
        receipt_email: state.email,
      },
      redirect: 'if_required',
    })

    if (stripeError) throw new Error(stripeError.message)

    // Paiement réussi sans redirect (ex: virement)
    window.location.href = `/lasourcedarimont/confirmation.html?id=${state.reservationId}`
  } catch (err) {
    afficherErreur('Une erreur est survenue. Veuillez réessayer ou nous contacter directement.')
    console.error(err)
  } finally {
    label.hidden  = false
    loader.hidden = true
    submitBtn.disabled = false
  }
}
```

- [ ] **Step 5 : Test end-to-end complet**

```bash
npx netlify dev
```

1. Aller sur `http://localhost:8888/reservation.html`
2. Étape 1 : sélectionner le logement test
3. Étape 2 : choisir des dates disponibles — vérifier l'affichage du prix
4. Étape 3 : remplir le formulaire client
5. Étape 4 (paiement) : vérifier que Stripe Elements se monte avec le clientSecret
6. Payer avec la carte test `4242 4242 4242 4242` (exp: 12/34, CVC: 123)
7. Vérifier la redirection vers `confirmation.html`
8. Vérifier dans Sanity Studio : réservation en statut "demande"
9. Vérifier réception des 2 emails (client + propriétaire)
10. Cliquer [Confirmer] dans l'email propriétaire → vérifier email "Réservation confirmée"

- [ ] **Step 6 : Commit**

```bash
git add src/reservation.js
git commit -m "feat: câblage Stripe Payment Element avec clientSecret (flux corrigé)"
```

---

## Vérification finale

**Spec coverage Plan B :**

| Exigence | Task |
|----------|------|
| iCal outbound `/api/ical/:logementId` | Task 1 |
| Classification SUMMARY → reservation/blocage | Task 2 |
| Sync inbound Booking → Sanity (upsert + delete) | Task 2 |
| Cron sync iCal 30min | Task 3 |
| Rappel propriétaire après 2h | Task 4 |
| Remboursement auto après 24h | Task 4 |
| Email pré-arrivée 7 jours avant | Task 5 |
| Page confirmation.html | Task 6 |
| Flux Stripe corrigé (clientSecret avant mount) | Task 7 |
