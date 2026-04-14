# Système de réservation — Plan A : Backend

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implémenter le backend serverless permettant à un client de réserver un logement, payer un acompte, et recevoir des emails de confirmation — et au propriétaire de confirmer ou refuser en un clic.

**Architecture:** Netlify Functions ESM (Node 20) + Sanity (BDD write-side, token SANITY_API_TOKEN) + Stripe (paiements) + Resend (emails). La logique métier pure (tarification, tokens) est dans `netlify/functions/lib/` et testée avec Vitest. Les templates email sont dans `netlify/functions/emails/`.

**Tech Stack:** Netlify Functions, @sanity/client, stripe, resend, @netlify/functions, node-ical, vitest

---

## Map des fichiers

### Créer
```
netlify/
  functions/
    lib/
      sanity.js          ← client Sanity server-side (write)
      tokens.js          ← génération tokens confirm/refus
      tarification.js    ← moteur de calcul prix (pur, testable)
      disponibilite.js   ← vérification dispo côté serveur
      emails.js          ← sendEmail() via Resend
    emails/
      i18n/
        fr.js            ← traductions FR
        nl.js            ← traductions NL
        en.js            ← traductions EN
      templates/
        demande-recue.js
        nouvelle-reservation.js
        reservation-confirmee.js
        reservation-annulee.js
        avant-arrivee.js
    reservation.js       ← POST /api/reservation
    stripe-webhook.js    ← POST /api/stripe-webhook
    confirmer.js         ← GET /api/confirmer/:token
    refuser.js           ← GET /api/refuser/:token
sanity/
  schemas/
    logement.js
    tarifSaison.js
    reservation.js
    blocage.js
    infosPropriete.js
    index.js
  sanity.config.js
  package.json
tests/
  tarification.test.js
  disponibilite.test.js
vitest.config.js
```

### Modifier
```
netlify.toml             ← ajouter redirections manquantes
package.json             ← ajouter resend, @netlify/functions, vitest
```

---

## Task 1 : Setup — dépendances + config test + netlify.toml

**Files:**
- Modify: `package.json`
- Modify: `netlify.toml`
- Create: `vitest.config.js`

- [ ] **Step 1 : Installer les dépendances manquantes**

```bash
npm install resend @netlify/functions node-ical
npm install -D vitest
```

Vérifier que `package.json` contient maintenant :
```json
{
  "dependencies": {
    "@sanity/client": "^7.16.0",
    "@sanity/image-url": "^2.0.3",
    "@stripe/stripe-js": "^9.1.0",
    "@netlify/functions": "^2.x",
    "gsap": "^3.14.2",
    "lenis": "^1.3.17",
    "node-ical": "^0.19.x",
    "resend": "^4.x",
    "stripe": "^22.0.0"
  },
  "devDependencies": {
    "vite": "^5.4.0",
    "vitest": "^2.x"
  }
}
```

- [ ] **Step 2 : Ajouter le script test dans package.json**

Éditer `package.json`, section `scripts` :
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 3 : Créer vitest.config.js**

```js
// vitest.config.js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
})
```

- [ ] **Step 4 : Mettre à jour netlify.toml — ajouter les redirections manquantes**

Remplacer le contenu de `netlify.toml` par :

```toml
[build]
  command   = "npm run build"
  publish   = "dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "20"

# ─── Redirections API ───────────────────────────────────────────────────────

[[redirects]]
  from   = "/api/reservation"
  to     = "/.netlify/functions/reservation"
  status = 200

[[redirects]]
  from   = "/api/stripe-webhook"
  to     = "/.netlify/functions/stripe-webhook"
  status = 200

[[redirects]]
  from   = "/api/confirmer/:token"
  to     = "/.netlify/functions/confirmer"
  status = 200

[[redirects]]
  from   = "/api/refuser/:token"
  to     = "/.netlify/functions/refuser"
  status = 200

[[redirects]]
  from   = "/api/ical/:logementId"
  to     = "/.netlify/functions/ical"
  status = 200

[[redirects]]
  from   = "/api/disponibilite/:logementId"
  to     = "/.netlify/functions/disponibilite"
  status = 200

# ─── Crons ──────────────────────────────────────────────────────────────────

[functions."sync-ical"]
  schedule = "*/30 * * * *"

[functions."sync-expirations"]
  schedule = "*/30 * * * *"

# ─── Fallback ───────────────────────────────────────────────────────────────

[[redirects]]
  from   = "/*"
  to     = "/index.html"
  status = 404
```

- [ ] **Step 5 : Commit**

```bash
git add package.json package-lock.json netlify.toml vitest.config.js
git commit -m "chore: setup test framework et redirections Netlify"
```

---

## Task 2 : Schémas Sanity

**Files:**
- Create: `sanity/package.json`
- Create: `sanity/sanity.config.js`
- Create: `sanity/schemas/logement.js`
- Create: `sanity/schemas/tarifSaison.js`
- Create: `sanity/schemas/reservation.js`
- Create: `sanity/schemas/blocage.js`
- Create: `sanity/schemas/infosPropriete.js`
- Create: `sanity/schemas/index.js`

> **Note :** Le projet Sanity existe déjà (`projectId: 'z25t0wsp'`). On crée les schémas dans un sous-dossier `sanity/` et on les déploie. Les noms de champs correspondent à ceux déjà utilisés dans `src/reservation.js` (`prixParNuit`, `capaciteMax`, etc.).

- [ ] **Step 1 : Créer sanity/package.json**

```json
{
  "name": "domaine-source-arimont-studio",
  "private": true,
  "version": "1.0.0",
  "scripts": {
    "dev": "sanity dev",
    "build": "sanity build",
    "deploy": "sanity deploy",
    "deploy-graphql": "sanity graphql deploy"
  },
  "dependencies": {
    "@sanity/vision": "^3",
    "sanity": "^3",
    "styled-components": "^6"
  }
}
```

Puis : `cd sanity && npm install`

- [ ] **Step 2 : Créer sanity/sanity.config.js**

```js
// sanity/sanity.config.js
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas/index.js'

export default defineConfig({
  name: 'default',
  title: 'Domaine de la Source d\'Arimont',
  projectId: 'z25t0wsp',
  dataset: 'production',
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
})
```

- [ ] **Step 3 : Créer sanity/schemas/logement.js**

```js
// sanity/schemas/logement.js
export const logement = {
  name: 'logement',
  title: 'Logement',
  type: 'document',
  fields: [
    {
      name: 'nom',
      title: 'Nom',
      type: 'string',
      validation: (R) => R.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'nom' },
      validation: (R) => R.required(),
    },
    {
      name: 'capaciteMax',
      title: 'Capacité max (personnes)',
      type: 'number',
      validation: (R) => R.required().integer().min(1),
    },
    {
      name: 'order',
      title: 'Ordre d\'affichage',
      type: 'number',
    },
    {
      name: 'actif',
      title: 'Actif',
      type: 'boolean',
      initialValue: true,
    },
    {
      name: 'description',
      title: 'Description',
      type: 'object',
      fields: [
        { name: 'fr', title: 'FR', type: 'text' },
        { name: 'nl', title: 'NL', type: 'text' },
        { name: 'en', title: 'EN', type: 'text' },
      ],
    },
    {
      name: 'photos',
      title: 'Photos',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    },
    {
      name: 'fraisMenage',
      title: 'Frais de ménage (€)',
      type: 'number',
      initialValue: 0,
    },
    {
      name: 'taxeSejour',
      title: 'Taxe de séjour (€/personne/nuit)',
      type: 'number',
      initialValue: 0,
    },
    {
      name: 'acomptePercent',
      title: 'Acompte (%)',
      type: 'number',
      initialValue: 30,
    },
    {
      name: 'dureeMinNuits',
      title: 'Durée minimum (nuits)',
      type: 'number',
    },
    {
      name: 'icalUrlBooking',
      title: 'URL iCal Booking.com',
      type: 'url',
    },
    {
      name: 'instructionsArrivee',
      title: 'Instructions d\'arrivée',
      type: 'object',
      fields: [
        { name: 'fr', title: 'FR', type: 'text' },
        { name: 'nl', title: 'NL', type: 'text' },
        { name: 'en', title: 'EN', type: 'text' },
      ],
    },
  ],
  preview: {
    select: { title: 'nom', subtitle: 'capaciteMax' },
    prepare({ title, subtitle }) {
      return { title, subtitle: `Capacité : ${subtitle} personnes` }
    },
  },
}
```

- [ ] **Step 4 : Créer sanity/schemas/tarifSaison.js**

```js
// sanity/schemas/tarifSaison.js
export const tarifSaison = {
  name: 'tarifSaison',
  title: 'Tarif / Saison',
  type: 'document',
  fields: [
    {
      name: 'logement',
      title: 'Logement',
      type: 'reference',
      to: [{ type: 'logement' }],
    },
    {
      name: 'nom',
      title: 'Nom',
      type: 'string',
      validation: (R) => R.required(),
    },
    {
      name: 'dateDebut',
      title: 'Date début',
      type: 'date',
      validation: (R) => R.required(),
    },
    {
      name: 'dateFin',
      title: 'Date fin',
      type: 'date',
      validation: (R) => R.required(),
    },
    {
      name: 'prixParNuit',
      title: 'Prix par nuit (€)',
      type: 'number',
      validation: (R) => R.required().min(0),
    },
    {
      name: 'prixWeekend',
      title: 'Prix week-end (€) — vendredi et samedi soir',
      type: 'number',
    },
    {
      name: 'priorite',
      title: 'Priorité (1 = la plus haute)',
      type: 'number',
      initialValue: 10,
      validation: (R) => R.required().integer().min(1),
    },
  ],
  preview: {
    select: { title: 'nom', start: 'dateDebut', end: 'dateFin', prix: 'prixParNuit' },
    prepare({ title, start, end, prix }) {
      return { title, subtitle: `${start} → ${end} · ${prix}€/nuit` }
    },
  },
}
```

- [ ] **Step 5 : Créer sanity/schemas/reservation.js**

```js
// sanity/schemas/reservation.js
export const reservation = {
  name: 'reservation',
  title: 'Réservation',
  type: 'document',
  readOnly: true,
  fields: [
    {
      name: 'logement',
      title: 'Logement',
      type: 'reference',
      to: [{ type: 'logement' }],
    },
    {
      name: 'source',
      title: 'Source',
      type: 'string',
      options: { list: ['direct', 'booking.com'] },
    },
    {
      name: 'statut',
      title: 'Statut',
      type: 'string',
      options: {
        list: [
          { title: 'En attente paiement', value: 'en_attente_paiement' },
          { title: 'Demande', value: 'demande' },
          { title: 'Confirmée', value: 'confirmee' },
          { title: 'Annulée', value: 'annulee' },
          { title: 'Expirée', value: 'expiree' },
        ],
      },
    },
    { name: 'dateArrivee', title: 'Arrivée', type: 'date' },
    { name: 'dateDepart', title: 'Départ', type: 'date' },
    { name: 'nbAdultes', title: 'Adultes', type: 'number' },
    { name: 'nbEnfants', title: 'Enfants', type: 'number' },
    {
      name: 'client',
      title: 'Client',
      type: 'object',
      fields: [
        { name: 'prenom', title: 'Prénom', type: 'string' },
        { name: 'nom', title: 'Nom', type: 'string' },
        { name: 'email', title: 'Email', type: 'string' },
        { name: 'telephone', title: 'Téléphone', type: 'string' },
        { name: 'pays', title: 'Pays', type: 'string' },
        {
          name: 'langue',
          title: 'Langue',
          type: 'string',
          options: { list: ['fr', 'nl', 'en'] },
        },
      ],
    },
    { name: 'prixTotal', title: 'Prix total (€)', type: 'number' },
    { name: 'acompte', title: 'Acompte (€)', type: 'number' },
    { name: 'solde', title: 'Solde (€)', type: 'number' },
    { name: 'stripePaymentIntentId', title: 'Stripe Payment Intent ID', type: 'string' },
    { name: 'stripeRefundId', title: 'Stripe Refund ID', type: 'string' },
    { name: 'tokenConfirmer', title: 'Token confirmer', type: 'string', hidden: true },
    { name: 'tokenRefuser', title: 'Token refuser', type: 'string', hidden: true },
    { name: 'rappelEnvoye', title: 'Rappel envoyé', type: 'boolean', initialValue: false },
    { name: 'creeA', title: 'Créée à', type: 'datetime' },
    { name: 'icalUid', title: 'iCal UID (Booking.com)', type: 'string' },
  ],
  preview: {
    select: { logement: 'logement.nom', arrivee: 'dateArrivee', statut: 'statut', client: 'client.nom' },
    prepare({ logement, arrivee, statut, client }) {
      return { title: `${logement ?? '?'} — ${arrivee ?? '?'}`, subtitle: `${client ?? '?'} · ${statut}` }
    },
  },
}
```

- [ ] **Step 6 : Créer sanity/schemas/blocage.js**

```js
// sanity/schemas/blocage.js
export const blocage = {
  name: 'blocage',
  title: 'Blocage',
  type: 'document',
  fields: [
    {
      name: 'logement',
      title: 'Logement',
      type: 'reference',
      to: [{ type: 'logement' }],
      validation: (R) => R.required(),
    },
    { name: 'dateDebut', title: 'Date début', type: 'date', validation: (R) => R.required() },
    { name: 'dateFin', title: 'Date fin', type: 'date', validation: (R) => R.required() },
    {
      name: 'source',
      title: 'Source',
      type: 'string',
      options: { list: ['manuel', 'booking.com'] },
      initialValue: 'manuel',
    },
    { name: 'icalUid', title: 'iCal UID', type: 'string' },
    { name: 'note', title: 'Note interne', type: 'text' },
  ],
  preview: {
    select: { logement: 'logement.nom', debut: 'dateDebut', fin: 'dateFin', source: 'source' },
    prepare({ logement, debut, fin, source }) {
      return { title: `${logement ?? '?'} : ${debut} → ${fin}`, subtitle: source }
    },
  },
}
```

- [ ] **Step 7 : Créer sanity/schemas/infosPropriete.js**

```js
// sanity/schemas/infosPropriete.js
export const infosPropriete = {
  name: 'infosPropriete',
  title: 'Infos de la propriété',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    { name: 'adresse', title: 'Adresse', type: 'string' },
    { name: 'coordonneesGPS', title: 'Coordonnées GPS', type: 'string' },
    { name: 'telephone', title: 'Téléphone', type: 'string' },
    { name: 'emailContact', title: 'Email de contact', type: 'string' },
    { name: 'heureArrivee', title: 'Heure d\'arrivée', type: 'string', initialValue: '15:00' },
    { name: 'heureDepart', title: 'Heure de départ', type: 'string', initialValue: '11:00' },
    {
      name: 'reglement',
      title: 'Règlement de la maison',
      type: 'object',
      fields: [
        { name: 'fr', title: 'FR', type: 'text' },
        { name: 'nl', title: 'NL', type: 'text' },
        { name: 'en', title: 'EN', type: 'text' },
      ],
    },
  ],
}
```

- [ ] **Step 8 : Créer sanity/schemas/index.js**

```js
// sanity/schemas/index.js
import { logement } from './logement.js'
import { tarifSaison } from './tarifSaison.js'
import { reservation } from './reservation.js'
import { blocage } from './blocage.js'
import { infosPropriete } from './infosPropriete.js'

export const schemaTypes = [logement, tarifSaison, reservation, blocage, infosPropriete]
```

- [ ] **Step 9 : Déployer les schémas**

```bash
cd sanity
npx sanity deploy
```

Vérifier dans Sanity Studio que les 5 types de documents apparaissent.

- [ ] **Step 10 : Créer un document logement de test dans Sanity Studio**

Dans le Studio, créer un logement avec :
- Nom : "Gîte Test"
- capaciteMax : 4
- fraisMenage : 50
- taxeSejour : 2
- acomptePercent : 30

Et un tarifSaison associé :
- Nom : "Été 2026"
- dateDebut : 2026-06-01 / dateFin : 2026-09-30
- prixParNuit : 120
- priorite : 1

- [ ] **Step 11 : Commit**

```bash
git add sanity/
git commit -m "feat: schémas Sanity (logement, tarifSaison, reservation, blocage, infosPropriete)"
```

---

## Task 3 : Lib serveur — sanity.js + tokens.js

**Files:**
- Create: `netlify/functions/lib/sanity.js`
- Create: `netlify/functions/lib/tokens.js`

- [ ] **Step 1 : Créer netlify/functions/lib/sanity.js**

```js
// netlify/functions/lib/sanity.js
import { createClient } from '@sanity/client'

export const sanity = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET ?? 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})
```

- [ ] **Step 2 : Créer netlify/functions/lib/tokens.js**

```js
// netlify/functions/lib/tokens.js
import { randomBytes } from 'crypto'

/** Génère un token hexadécimal de 64 caractères (256 bits d'entropie). */
export function genererToken() {
  return randomBytes(32).toString('hex')
}
```

- [ ] **Step 3 : Commit**

```bash
git add netlify/functions/lib/sanity.js netlify/functions/lib/tokens.js
git commit -m "feat: lib serveur sanity client + génération tokens"
```

---

## Task 4 : TDD — Moteur de tarification

**Files:**
- Create: `netlify/functions/lib/tarification.js`
- Create: `tests/tarification.test.js`

- [ ] **Step 1 : Écrire les tests**

```js
// tests/tarification.test.js
import { describe, it, expect } from 'vitest'
import { calculerPrix } from '../netlify/functions/lib/tarification.js'

const tarifBase = {
  prixParNuit: 100,
  prixWeekend: null,
  fraisMenage: 50,
  taxeSejour: 2,
  acomptePercent: 30,
}

describe('calculerPrix', () => {
  it('retourne null si tarif null', () => {
    expect(calculerPrix(null, '2026-06-10', '2026-06-12', 2, 0)).toBeNull()
  })

  it('retourne null si 0 nuit', () => {
    expect(calculerPrix(tarifBase, '2026-06-10', '2026-06-10', 2, 0)).toBeNull()
  })

  it('calcule correctement 2 nuits en semaine', () => {
    // 2026-06-10 (mercredi) → 2026-06-12 (vendredi)
    const r = calculerPrix(tarifBase, '2026-06-10', '2026-06-12', 2, 0)
    expect(r.nuits).toBe(2)
    expect(r.prixNuits).toBe(200)          // 2 × 100
    expect(r.menage).toBe(50)
    expect(r.taxe).toBe(8)                 // 2€ × 2 pers × 2 nuits
    expect(r.total).toBe(258)
    expect(r.acompte).toBe(78)             // ceil(258 × 0.30)
    expect(r.solde).toBe(180)
    expect(r.acomptePercent).toBe(30)
  })

  it('applique prixWeekend pour vendredi et samedi soir', () => {
    const tarif = { ...tarifBase, prixWeekend: 150 }
    // 2026-06-12 (vendredi) → 2026-06-14 (dimanche) = ven(150) + sam(150)
    const r = calculerPrix(tarif, '2026-06-12', '2026-06-14', 2, 0)
    expect(r.prixNuits).toBe(300)
  })

  it('mélange semaine + week-end', () => {
    const tarif = { ...tarifBase, prixWeekend: 150 }
    // 2026-06-11 (jeudi) → 2026-06-14 (dimanche) = jeu(100) + ven(150) + sam(150)
    const r = calculerPrix(tarif, '2026-06-11', '2026-06-14', 2, 0)
    expect(r.prixNuits).toBe(400)
    expect(r.nuits).toBe(3)
  })

  it('compte adultes + enfants dans la taxe', () => {
    const r = calculerPrix(tarifBase, '2026-06-10', '2026-06-12', 2, 1)
    expect(r.taxe).toBe(12) // 2€ × 3 pers × 2 nuits
  })

  it('utilise prixParNuit si prixWeekend non défini', () => {
    const tarif = { ...tarifBase, prixWeekend: undefined }
    const r = calculerPrix(tarif, '2026-06-12', '2026-06-14', 2, 0)
    expect(r.prixNuits).toBe(200) // 100 × 2 (pas de fallback weekend)
  })
})
```

- [ ] **Step 2 : Vérifier que les tests échouent**

```bash
npm test
```

Expected output : `FAIL tests/tarification.test.js` avec "Cannot find module"

- [ ] **Step 3 : Créer netlify/functions/lib/tarification.js**

```js
// netlify/functions/lib/tarification.js

/**
 * Calcule le prix total d'un séjour nuit par nuit.
 *
 * @param {object} tarif   - Document tarifSaison Sanity
 * @param {string} arrivee - Date ISO YYYY-MM-DD
 * @param {string} depart  - Date ISO YYYY-MM-DD
 * @param {number} nbAdultes
 * @param {number} nbEnfants
 * @returns {{ nuits, prixNuits, menage, taxe, total, acompte, solde, acomptePercent } | null}
 */
export function calculerPrix(tarif, arrivee, depart, nbAdultes, nbEnfants) {
  if (!tarif || !arrivee || !depart) return null

  const dateArrivee = new Date(arrivee)
  const dateDepart = new Date(depart)
  const nuits = Math.round((dateDepart - dateArrivee) / 86_400_000)
  if (nuits <= 0) return null

  let prixNuits = 0
  const d = new Date(arrivee)
  for (let i = 0; i < nuits; i++) {
    const jour = d.getDay() // 5 = vendredi, 6 = samedi
    const estWeekend = jour === 5 || jour === 6
    prixNuits += estWeekend && tarif.prixWeekend ? tarif.prixWeekend : tarif.prixParNuit
    d.setDate(d.getDate() + 1)
  }

  const menage = tarif.fraisMenage ?? 0
  const taxe = (tarif.taxeSejour ?? 0) * (nbAdultes + nbEnfants) * nuits
  const total = prixNuits + menage + taxe
  const pct = tarif.acomptePercent ?? 30
  const acompte = Math.ceil(total * pct / 100)
  const solde = total - acompte

  return { nuits, prixNuits, menage, taxe, total, acompte, solde, acomptePercent: pct }
}
```

- [ ] **Step 4 : Vérifier que les tests passent**

```bash
npm test
```

Expected output : `PASS tests/tarification.test.js` — 7 tests passed.

- [ ] **Step 5 : Commit**

```bash
git add netlify/functions/lib/tarification.js tests/tarification.test.js
git commit -m "feat: moteur de tarification + tests (TDD)"
```

---

## Task 5 : TDD — Vérification de disponibilité côté serveur

**Files:**
- Create: `netlify/functions/lib/disponibilite.js`
- Create: `tests/disponibilite.test.js`

- [ ] **Step 1 : Écrire les tests (avec mock Sanity)**

```js
// tests/disponibilite.test.js
import { describe, it, expect, vi } from 'vitest'
import { verifierDispo } from '../netlify/functions/lib/disponibilite.js'

// Mock du module sanity
vi.mock('../netlify/functions/lib/sanity.js', () => ({
  sanity: {
    fetch: vi.fn(),
  },
}))

import { sanity } from '../netlify/functions/lib/sanity.js'

describe('verifierDispo', () => {
  it('retourne disponible si aucun conflit', async () => {
    sanity.fetch.mockResolvedValue([])
    const result = await verifierDispo('logement-id', '2026-07-01', '2026-07-05')
    expect(result.disponible).toBe(true)
    expect(result.conflit).toBe(false)
  })

  it('retourne conflit si réservation chevauchante', async () => {
    sanity.fetch
      .mockResolvedValueOnce(['resa-1'])  // réservations
      .mockResolvedValueOnce([])          // blocages
    const result = await verifierDispo('logement-id', '2026-07-01', '2026-07-05')
    expect(result.disponible).toBe(false)
    expect(result.conflit).toBe(true)
  })

  it('retourne conflit si blocage chevauchant', async () => {
    sanity.fetch
      .mockResolvedValueOnce([])          // réservations
      .mockResolvedValueOnce(['blocage-1']) // blocages
    const result = await verifierDispo('logement-id', '2026-07-01', '2026-07-05')
    expect(result.disponible).toBe(false)
    expect(result.conflit).toBe(true)
  })
})
```

- [ ] **Step 2 : Vérifier que les tests échouent**

```bash
npm test
```

Expected : FAIL — "Cannot find module"

- [ ] **Step 3 : Créer netlify/functions/lib/disponibilite.js**

```js
// netlify/functions/lib/disponibilite.js
import { sanity } from './sanity.js'

/**
 * Vérifie la disponibilité d'un logement pour des dates données.
 * Interroge Sanity en temps réel (pas de CDN cache).
 *
 * @returns {{ disponible: boolean, conflit: boolean }}
 */
export async function verifierDispo(logementId, arrivee, depart) {
  const [reservations, blocages] = await Promise.all([
    sanity.fetch(
      `*[_type == "reservation"
        && logement._ref == $logementId
        && statut in ["demande", "confirmee"]
        && dateArrivee < $depart
        && dateDepart > $arrivee
      ]._id`,
      { logementId, arrivee, depart }
    ),
    sanity.fetch(
      `*[_type == "blocage"
        && logement._ref == $logementId
        && dateDebut < $depart
        && dateFin > $arrivee
      ]._id`,
      { logementId, arrivee, depart }
    ),
  ])

  const conflit = reservations.length > 0 || blocages.length > 0
  return { disponible: !conflit, conflit }
}
```

- [ ] **Step 4 : Vérifier que les tests passent**

```bash
npm test
```

Expected : PASS — 3 tests passed.

- [ ] **Step 5 : Commit**

```bash
git add netlify/functions/lib/disponibilite.js tests/disponibilite.test.js
git commit -m "feat: vérification disponibilité serveur + tests (TDD)"
```

---

## Task 6 : Netlify Function — POST /api/reservation

**Files:**
- Create: `netlify/functions/reservation.js`

- [ ] **Step 1 : Créer netlify/functions/reservation.js**

```js
// netlify/functions/reservation.js
import Stripe from 'stripe'
import { sanity } from './lib/sanity.js'
import { genererToken } from './lib/tokens.js'
import { verifierDispo } from './lib/disponibilite.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  // ── 1. Parser le body ────────────────────────────────────────────────────

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Corps JSON invalide' }) }
  }

  const {
    logementId,
    arrivee,
    depart,
    nbAdultes = 2,
    nbEnfants = 0,
    langue = 'fr',
    prenom,
    nom,
    email,
    telephone,
    pays,
    montantTotal,
    montantAcompte,
  } = body

  // ── 2. Validation des champs obligatoires ───────────────────────────────

  if (!logementId || !arrivee || !depart || !email || !nom || !prenom || !montantAcompte) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Champs obligatoires manquants.' }),
    }
  }

  if (montantAcompte <= 0 || montantTotal <= 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Montant invalide.' }),
    }
  }

  // ── 3. Vérification disponibilité fraîche ───────────────────────────────

  try {
    const { conflit } = await verifierDispo(logementId, arrivee, depart)
    if (conflit) {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: 'Ces dates ne sont plus disponibles. Veuillez en choisir d\'autres.' }),
      }
    }
  } catch (e) {
    console.error('Erreur vérif dispo:', e)
    return { statusCode: 500, body: JSON.stringify({ error: 'Erreur vérification disponibilité.' }) }
  }

  // ── 4. Créer le Payment Intent Stripe ──────────────────────────────────

  let paymentIntent
  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(montantAcompte * 100), // en centimes
      currency: 'eur',
      receipt_email: email,
      metadata: { logementId, arrivee, depart, clientEmail: email },
    })
  } catch (e) {
    console.error('Stripe PaymentIntent error:', e)
    return { statusCode: 500, body: JSON.stringify({ error: 'Erreur création du paiement.' }) }
  }

  // ── 5. Créer la réservation dans Sanity (statut: en_attente_paiement) ──

  const tokenConfirmer = genererToken()
  const tokenRefuser = genererToken()

  let resaId
  try {
    const doc = await sanity.create({
      _type: 'reservation',
      logement: { _type: 'reference', _ref: logementId },
      source: 'direct',
      statut: 'en_attente_paiement',
      dateArrivee: arrivee,
      dateDepart: depart,
      nbAdultes,
      nbEnfants,
      client: { prenom, nom, email, telephone: telephone ?? '', pays: pays ?? '', langue },
      prixTotal: montantTotal,
      acompte: montantAcompte,
      solde: montantTotal - montantAcompte,
      stripePaymentIntentId: paymentIntent.id,
      tokenConfirmer,
      tokenRefuser,
      rappelEnvoye: false,
      creeA: new Date().toISOString(),
    })
    resaId = doc._id
  } catch (e) {
    console.error('Sanity create error:', e)
    // Annuler le Payment Intent pour ne pas laisser de PI orphelin
    await stripe.paymentIntents.cancel(paymentIntent.id).catch(() => {})
    return { statusCode: 500, body: JSON.stringify({ error: 'Erreur création de la réservation.' }) }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientSecret: paymentIntent.client_secret,
      reservationId: resaId,
    }),
  }
}
```

- [ ] **Step 2 : Tester manuellement avec curl (après avoir configuré les env vars)**

Créer un fichier `.env.local` (non commité) :
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
SANITY_PROJECT_ID=z25t0wsp
SANITY_DATASET=production
SANITY_API_TOKEN=sk...
SITE_URL=http://localhost:8888
OWNER_EMAIL=votre@email.com
RESEND_API_KEY=re_...
```

Lancer le serveur de dev Netlify :
```bash
npx netlify dev
```

Tester avec curl :
```bash
curl -X POST http://localhost:8888/api/reservation \
  -H "Content-Type: application/json" \
  -d '{
    "logementId": "<_id du logement test créé à la Task 2>",
    "arrivee": "2026-08-01",
    "depart": "2026-08-05",
    "nbAdultes": 2,
    "nbEnfants": 0,
    "langue": "fr",
    "prenom": "Alice",
    "nom": "Dupont",
    "email": "test@example.com",
    "telephone": "+32 123 456 789",
    "pays": "BE",
    "montantTotal": 530,
    "montantAcompte": 159
  }'
```

Expected : `{"clientSecret":"pi_..._secret_...","reservationId":"..."}`
Vérifier dans Sanity Studio que la réservation apparaît avec statut `en_attente_paiement`.

- [ ] **Step 3 : Commit**

```bash
git add netlify/functions/reservation.js
git commit -m "feat: Netlify Function POST /api/reservation"
```

---

## Task 7 : Netlify Function — POST /api/stripe-webhook

**Files:**
- Create: `netlify/functions/stripe-webhook.js`

> La function reçoit l'event `payment_intent.succeeded`, passe la résa en statut `demande`, et déclenche les 2 emails (client + propriétaire). Les emails sont ajoutés en Task 11 — pour l'instant on intègre des placeholders commentés.

- [ ] **Step 1 : Créer netlify/functions/stripe-webhook.js**

```js
// netlify/functions/stripe-webhook.js
import Stripe from 'stripe'
import { sanity } from './lib/sanity.js'
// import { sendEmail } from './lib/emails.js'  // décommenté en Task 11

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  // ── 1. Vérification signature Stripe ────────────────────────────────────

  const sig = event.headers['stripe-signature']
  let stripeEvent

  try {
    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf8')
      : event.body
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (e) {
    console.error('Stripe webhook signature invalide:', e.message)
    return { statusCode: 400, body: `Webhook Error: ${e.message}` }
  }

  // ── 2. Traiter payment_intent.succeeded ─────────────────────────────────

  if (stripeEvent.type === 'payment_intent.succeeded') {
    const pi = stripeEvent.data.object
    const piId = pi.id

    // Trouver la réservation correspondante
    const resa = await sanity.fetch(
      `*[_type == "reservation" && stripePaymentIntentId == $piId][0]{
        ...,
        "logementNom": logement->nom
      }`,
      { piId }
    )

    if (!resa) {
      console.error('Réservation introuvable pour PI:', piId)
      return { statusCode: 200, body: 'OK' }
    }

    // Passer en statut "demande"
    await sanity.patch(resa._id).set({ statut: 'demande' }).commit()

    // Envoyer les emails (décommenté en Task 11)
    // const siteUrl = process.env.SITE_URL
    // await Promise.all([
    //   sendEmail('demande-recue', resa),
    //   sendEmail('nouvelle-reservation', resa, { siteUrl }),
    // ])

    console.log(`Réservation ${resa._id} passée en "demande"`)
  }

  return { statusCode: 200, body: 'OK' }
}
```

- [ ] **Step 2 : Tester le webhook avec Stripe CLI**

```bash
# Terminal 1 : serveur Netlify
npx netlify dev

# Terminal 2 : écoute Stripe
stripe listen --forward-to http://localhost:8888/api/stripe-webhook

# Terminal 3 : déclencher un événement de test
stripe trigger payment_intent.succeeded
```

Expected dans Terminal 1 : log `Réservation ... passée en "demande"` (si un PI orphelin existe) ou log "Réservation introuvable" (normal pour un PI de test sans résa associée).

- [ ] **Step 3 : Commit**

```bash
git add netlify/functions/stripe-webhook.js
git commit -m "feat: Netlify Function POST /api/stripe-webhook"
```

---

## Task 8 : Netlify Functions — confirmer + refuser

**Files:**
- Create: `netlify/functions/confirmer.js`
- Create: `netlify/functions/refuser.js`

- [ ] **Step 1 : Créer netlify/functions/confirmer.js**

```js
// netlify/functions/confirmer.js
import { sanity } from './lib/sanity.js'
// import { sendEmail } from './lib/emails.js'  // décommenté en Task 11

export const handler = async (event) => {
  // Le token est passé dans le path : /api/confirmer/TOKEN
  const segments = event.path.split('/')
  const token = segments[segments.length - 1]

  if (!token || token.length < 10) {
    return redirect(process.env.SITE_URL, 'invalide')
  }

  // Chercher la résa avec ce token et en statut "demande"
  const resa = await sanity.fetch(
    `*[_type == "reservation"
      && tokenConfirmer == $token
      && statut == "demande"
    ][0]{
      ...,
      logement->{ _id, nom, instructionsArrivee }
    }`,
    { token }
  )

  if (!resa) {
    return redirect(process.env.SITE_URL, 'invalide')
  }

  // Confirmer + invalider les tokens
  await sanity
    .patch(resa._id)
    .set({ statut: 'confirmee', tokenConfirmer: null, tokenRefuser: null })
    .commit()

  // Envoyer email confirmation au client (décommenté en Task 11)
  // await sendEmail('reservation-confirmee', resa)

  console.log(`Réservation ${resa._id} confirmée`)

  const nom = encodeURIComponent(resa.client?.nom ?? '')
  return redirect(process.env.SITE_URL, `confirmee&nom=${nom}`)
}

function redirect(siteUrl, action) {
  return {
    statusCode: 302,
    headers: { Location: `${siteUrl ?? '/'}?action=${action}` },
    body: '',
  }
}
```

- [ ] **Step 2 : Créer netlify/functions/refuser.js**

```js
// netlify/functions/refuser.js
import Stripe from 'stripe'
import { sanity } from './lib/sanity.js'
// import { sendEmail } from './lib/emails.js'  // décommenté en Task 11

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const handler = async (event) => {
  const segments = event.path.split('/')
  const token = segments[segments.length - 1]

  if (!token || token.length < 10) {
    return redirect(process.env.SITE_URL, 'invalide')
  }

  const resa = await sanity.fetch(
    `*[_type == "reservation"
      && tokenRefuser == $token
      && statut == "demande"
    ][0]`,
    { token }
  )

  if (!resa) {
    return redirect(process.env.SITE_URL, 'invalide')
  }

  // Rembourser l'acompte via Stripe
  try {
    const refund = await stripe.refunds.create({
      payment_intent: resa.stripePaymentIntentId,
    })
    await sanity.patch(resa._id).set({ stripeRefundId: refund.id }).commit()
  } catch (e) {
    console.error('Erreur remboursement Stripe:', e.message)
    // On continue pour mettre à jour le statut même si le refund échoue
  }

  // Annuler + invalider les tokens
  await sanity
    .patch(resa._id)
    .set({ statut: 'annulee', tokenConfirmer: null, tokenRefuser: null })
    .commit()

  // Envoyer email annulation au client (décommenté en Task 11)
  // await sendEmail('reservation-annulee', resa)

  console.log(`Réservation ${resa._id} annulée + remboursement initié`)

  return redirect(process.env.SITE_URL, 'annulee')
}

function redirect(siteUrl, action) {
  return {
    statusCode: 302,
    headers: { Location: `${siteUrl ?? '/'}?action=${action}` },
    body: '',
  }
}
```

- [ ] **Step 3 : Tester le flux confirmer/refuser manuellement**

```bash
# Avec Netlify dev en route, prendre l'ID d'une résa en statut "demande"
# et son token depuis Sanity Studio

curl -L "http://localhost:8888/api/confirmer/TOKEN_ICI"
# Expected : redirect vers SITE_URL?action=confirmee&nom=...
# Vérifier dans Sanity Studio que statut = "confirmee"
```

- [ ] **Step 4 : Commit**

```bash
git add netlify/functions/confirmer.js netlify/functions/refuser.js
git commit -m "feat: Netlify Functions confirmer + refuser (avec remboursement Stripe)"
```

---

## Task 9 : Email — i18n (FR / NL / EN)

**Files:**
- Create: `netlify/functions/emails/i18n/fr.js`
- Create: `netlify/functions/emails/i18n/nl.js`
- Create: `netlify/functions/emails/i18n/en.js`

- [ ] **Step 1 : Créer netlify/functions/emails/i18n/fr.js**

```js
// netlify/functions/emails/i18n/fr.js
export default {
  'demande-recue': {
    subject: (logement, arrivee, depart) =>
      `Votre demande de réservation — ${logement}, du ${arrivee} au ${depart}`,
    titre: 'Demande reçue',
    intro: 'Nous avons bien reçu votre demande de réservation et votre acompte.',
    acompte: 'Acompte réglé',
    solde: 'Solde à régler sur place',
    delai: 'Vous recevrez une confirmation sous 1h.',
    contact: 'Une question ? Contactez-nous directement :',
  },
  'nouvelle-reservation': {
    subject: (logement, arrivee, depart) =>
      `Nouvelle demande — ${logement} du ${arrivee} au ${depart}`,
    titre: 'Nouvelle demande de réservation',
    confirmer: 'Confirmer',
    refuser: 'Refuser',
    studio: 'Voir dans Sanity Studio',
    acompteRecu: 'Acompte reçu',
  },
  'reservation-confirmee': {
    subject: (logement, arrivee, depart) =>
      `Réservation confirmée — ${logement}, du ${arrivee} au ${depart}`,
    titre: 'Réservation confirmée !',
    intro: 'Votre séjour est confirmé. Nous avons hâte de vous accueillir.',
    solde: 'Solde à régler sur place',
    adresse: 'Adresse',
    arrivee: 'Arrivée',
    depart: 'Départ',
    instructions: 'Instructions d\'arrivée',
    contact: 'Une question ? Contactez-nous :',
  },
  'reservation-annulee': {
    subject: 'Votre demande de réservation n\'a pas pu être confirmée',
    titre: 'Demande non confirmée',
    intro: 'Nous sommes désolés, votre demande n\'a pas pu être confirmée pour ces dates.',
    remboursement: 'Votre acompte vous sera remboursé intégralement sous 5 à 10 jours ouvrables.',
    invitation: 'N\'hésitez pas à consulter nos disponibilités pour d\'autres dates.',
    contact: 'Pour toute question, contactez-nous directement :',
  },
  'avant-arrivee': {
    subject: (logement, jours) =>
      `Votre séjour approche — ${logement}, dans ${jours} jours`,
    titre: 'Votre séjour approche !',
    intro: 'Voici toutes les informations pour préparer votre arrivée.',
    solde: 'Solde à régler sur place',
    instructions: 'Informations d\'arrivée',
    adresse: 'Adresse',
    heureArrivee: 'Arrivée à partir de',
    heureDepart: 'Départ avant',
    contact: 'Pour toute question de dernière minute :',
  },
}
```

- [ ] **Step 2 : Créer netlify/functions/emails/i18n/nl.js**

```js
// netlify/functions/emails/i18n/nl.js
export default {
  'demande-recue': {
    subject: (logement, arrivee, depart) =>
      `Uw reserveringsaanvraag — ${logement}, van ${arrivee} tot ${depart}`,
    titre: 'Aanvraag ontvangen',
    intro: 'Wij hebben uw reserveringsaanvraag en uw aanbetaling goed ontvangen.',
    acompte: 'Betaalde aanbetaling',
    solde: 'Saldo te betalen bij aankomst',
    delai: 'U ontvangt een bevestiging binnen 1 uur.',
    contact: 'Een vraag? Neem rechtstreeks contact met ons op:',
  },
  'nouvelle-reservation': {
    subject: (logement, arrivee, depart) =>
      `Nieuwe aanvraag — ${logement} van ${arrivee} tot ${depart}`,
    titre: 'Nieuwe reserveringsaanvraag',
    confirmer: 'Bevestigen',
    refuser: 'Weigeren',
    studio: 'Bekijken in Sanity Studio',
    acompteRecu: 'Ontvangen aanbetaling',
  },
  'reservation-confirmee': {
    subject: (logement, arrivee, depart) =>
      `Reservering bevestigd — ${logement}, van ${arrivee} tot ${depart}`,
    titre: 'Reservering bevestigd!',
    intro: 'Uw verblijf is bevestigd. We kijken ernaar uit u te verwelkomen.',
    solde: 'Saldo te betalen bij aankomst',
    adresse: 'Adres',
    arrivee: 'Aankomst',
    depart: 'Vertrek',
    instructions: 'Aankomstinstructies',
    contact: 'Een vraag? Contacteer ons:',
  },
  'reservation-annulee': {
    subject: 'Uw reserveringsaanvraag kon niet worden bevestigd',
    titre: 'Aanvraag niet bevestigd',
    intro: 'Het spijt ons, uw aanvraag kon voor deze data niet worden bevestigd.',
    remboursement: 'Uw aanbetaling wordt volledig terugbetaald binnen 5 tot 10 werkdagen.',
    invitation: 'Aarzel niet om onze beschikbaarheid voor andere data te raadplegen.',
    contact: 'Voor vragen kunt u rechtstreeks contact met ons opnemen:',
  },
  'avant-arrivee': {
    subject: (logement, jours) =>
      `Uw verblijf nadert — ${logement}, over ${jours} dagen`,
    titre: 'Uw verblijf nadert!',
    intro: 'Hier vindt u alle informatie om uw aankomst voor te bereiden.',
    solde: 'Saldo te betalen bij aankomst',
    instructions: 'Aankomstinformatie',
    adresse: 'Adres',
    heureArrivee: 'Aankomst vanaf',
    heureDepart: 'Vertrek voor',
    contact: 'Voor last-minute vragen:',
  },
}
```

- [ ] **Step 3 : Créer netlify/functions/emails/i18n/en.js**

```js
// netlify/functions/emails/i18n/en.js
export default {
  'demande-recue': {
    subject: (logement, arrivee, depart) =>
      `Your booking request — ${logement}, from ${arrivee} to ${depart}`,
    titre: 'Request received',
    intro: 'We have received your booking request and your deposit.',
    acompte: 'Deposit paid',
    solde: 'Balance to pay on arrival',
    delai: 'You will receive a confirmation within 1 hour.',
    contact: 'Any questions? Contact us directly:',
  },
  'nouvelle-reservation': {
    subject: (logement, arrivee, depart) =>
      `New booking request — ${logement} from ${arrivee} to ${depart}`,
    titre: 'New booking request',
    confirmer: 'Confirm',
    refuser: 'Refuse',
    studio: 'View in Sanity Studio',
    acompteRecu: 'Deposit received',
  },
  'reservation-confirmee': {
    subject: (logement, arrivee, depart) =>
      `Booking confirmed — ${logement}, from ${arrivee} to ${depart}`,
    titre: 'Booking confirmed!',
    intro: 'Your stay is confirmed. We look forward to welcoming you.',
    solde: 'Balance to pay on arrival',
    adresse: 'Address',
    arrivee: 'Arrival',
    depart: 'Departure',
    instructions: 'Arrival instructions',
    contact: 'Any questions? Contact us:',
  },
  'reservation-annulee': {
    subject: 'Your booking request could not be confirmed',
    titre: 'Request not confirmed',
    intro: 'We are sorry, your request could not be confirmed for these dates.',
    remboursement: 'Your deposit will be fully refunded within 5 to 10 business days.',
    invitation: 'Feel free to check our availability for other dates.',
    contact: 'For any questions, contact us directly:',
  },
  'avant-arrivee': {
    subject: (logement, jours) =>
      `Your stay is coming up — ${logement}, in ${jours} days`,
    titre: 'Your stay is coming up!',
    intro: 'Here is all the information to prepare for your arrival.',
    solde: 'Balance to pay on arrival',
    instructions: 'Arrival information',
    adresse: 'Address',
    heureArrivee: 'Arrival from',
    heureDepart: 'Departure before',
    contact: 'For any last-minute questions:',
  },
}
```

- [ ] **Step 4 : Commit**

```bash
git add netlify/functions/emails/i18n/
git commit -m "feat: traductions emails FR/NL/EN"
```

---

## Task 10 : Email — 5 templates HTML

**Files:**
- Create: `netlify/functions/emails/templates/demande-recue.js`
- Create: `netlify/functions/emails/templates/nouvelle-reservation.js`
- Create: `netlify/functions/emails/templates/reservation-confirmee.js`
- Create: `netlify/functions/emails/templates/reservation-annulee.js`
- Create: `netlify/functions/emails/templates/avant-arrivee.js`

> Tous les templates suivent la même signature : `(resa, t, extra) => { to, subject, html }`.
> Style inline, compatible email clients. Palette : vert foncé `#2a5843`, fond `#f9f7f4`.

- [ ] **Step 1 : Créer le helper partagé — netlify/functions/emails/templates/_base.js**

```js
// netlify/functions/emails/templates/_base.js

export const fmtDate = (iso) => {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export const fmtEur = (n) =>
  n != null ? `${Math.round(n).toLocaleString('fr-BE')} €` : '—'

export function emailHtml({ titre, preheader, corps, footer }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${titre}</title>
</head>
<body style="margin:0;padding:0;background:#f9f7f4;font-family:Georgia,serif;color:#183528;">
  <div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0"
               style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);">
          <!-- Header -->
          <tr>
            <td style="background:#2a5843;padding:28px 40px;text-align:center;">
              <div style="color:#e8dfd0;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">Domaine de la Source d'Arimont</div>
              <div style="color:#ffffff;font-size:22px;font-weight:bold;">${titre}</div>
            </td>
          </tr>
          <!-- Corps -->
          <tr>
            <td style="padding:36px 40px;">
              ${corps}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f0ebe3;padding:20px 40px;text-align:center;font-size:12px;color:#6b7c6e;">
              ${footer}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function ligne(label, valeur) {
  return `
  <tr>
    <td style="padding:6px 0;font-size:14px;color:#6b7c6e;width:180px;">${label}</td>
    <td style="padding:6px 0;font-size:14px;font-weight:600;color:#183528;">${valeur}</td>
  </tr>`
}

export function bouton(href, label, couleur = '#2a5843') {
  return `<a href="${href}"
    style="display:inline-block;background:${couleur};color:#ffffff;font-size:15px;font-weight:600;
           padding:14px 32px;border-radius:8px;text-decoration:none;margin:8px 6px;">${label}</a>`
}
```

- [ ] **Step 2 : Créer netlify/functions/emails/templates/demande-recue.js**

```js
// netlify/functions/emails/templates/demande-recue.js
import { emailHtml, ligne, fmtDate, fmtEur } from './_base.js'

export function demandeRecue(resa, t) {
  const type = 'demande-recue'
  const logement = resa.logementNom ?? resa.logement?.nom ?? '—'
  const subject = t[type].subject(logement, fmtDate(resa.dateArrivee), fmtDate(resa.dateDepart))

  const corps = `
    <p style="font-size:16px;margin:0 0 20px;">${t[type].intro}</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 24px;">
      ${ligne('Logement', logement)}
      ${ligne('Arrivée', fmtDate(resa.dateArrivee))}
      ${ligne('Départ', fmtDate(resa.dateDepart))}
      ${ligne('Voyageurs', `${resa.nbAdultes ?? 2} adulte(s)${resa.nbEnfants ? `, ${resa.nbEnfants} enfant(s)` : ''}`)}
      ${ligne(t[type].acompte, fmtEur(resa.acompte))}
      ${ligne(t[type].solde, fmtEur(resa.solde))}
    </table>
    <div style="background:#f0f7f3;border-left:4px solid #2a5843;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:24px;">
      <strong>${t[type].delai}</strong>
    </div>
    <p style="font-size:14px;color:#6b7c6e;margin:0;">${t[type].contact}<br>
      <strong>${process.env.OWNER_EMAIL ?? ''}</strong>
    </p>`

  const html = emailHtml({
    titre: t[type].titre,
    preheader: subject,
    corps,
    footer: 'Domaine de la Source d\'Arimont · lasourcedarimont.be',
  })

  return { to: resa.client.email, subject, html }
}
```

- [ ] **Step 3 : Créer netlify/functions/emails/templates/nouvelle-reservation.js**

```js
// netlify/functions/emails/templates/nouvelle-reservation.js
import { emailHtml, ligne, bouton, fmtDate, fmtEur } from './_base.js'

export function nouvelleReservation(resa, t, extra = {}) {
  const type = 'nouvelle-reservation'
  const siteUrl = extra.siteUrl ?? process.env.SITE_URL ?? ''
  const logement = resa.logementNom ?? resa.logement?.nom ?? '—'
  const subject = t[type].subject(logement, fmtDate(resa.dateArrivee), fmtDate(resa.dateDepart))

  const urlConfirmer = `${siteUrl}/api/confirmer/${resa.tokenConfirmer}`
  const urlRefuser = `${siteUrl}/api/refuser/${resa.tokenRefuser}`
  const studioUrl = `https://lasourcedarimont.sanity.studio/structure/reservation;${resa._id}`

  const corps = `
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 24px;">
      ${ligne('Logement', logement)}
      ${ligne('Arrivée', fmtDate(resa.dateArrivee))}
      ${ligne('Départ', fmtDate(resa.dateDepart))}
      ${ligne('Voyageurs', `${resa.nbAdultes ?? 2} adulte(s)${resa.nbEnfants ? `, ${resa.nbEnfants} enfant(s)` : ''}`)}
      ${ligne('Client', `${resa.client?.prenom} ${resa.client?.nom}`)}
      ${ligne('Email', resa.client?.email ?? '—')}
      ${ligne('Téléphone', resa.client?.telephone ?? '—')}
      ${ligne('Pays', resa.client?.pays ?? '—')}
      ${ligne(t[type].acompteRecu, fmtEur(resa.acompte))}
    </table>
    <div style="text-align:center;margin:28px 0;">
      ${bouton(urlConfirmer, `✓ ${t[type].confirmer}`, '#2a5843')}
      ${bouton(urlRefuser, `✗ ${t[type].refuser}`, '#c0392b')}
    </div>
    <p style="text-align:center;">
      <a href="${studioUrl}" style="font-size:13px;color:#2a5843;">${t[type].studio}</a>
    </p>`

  const html = emailHtml({
    titre: t[type].titre,
    preheader: subject,
    corps,
    footer: 'Lien valable jusqu\'à confirmation ou refus.',
  })

  return { to: process.env.OWNER_EMAIL, subject, html }
}
```

- [ ] **Step 4 : Créer netlify/functions/emails/templates/reservation-confirmee.js**

```js
// netlify/functions/emails/templates/reservation-confirmee.js
import { emailHtml, ligne, fmtDate, fmtEur } from './_base.js'

export function reservationConfirmee(resa, t) {
  const type = 'reservation-confirmee'
  const logement = resa.logementNom ?? resa.logement?.nom ?? '—'
  const subject = t[type].subject(logement, fmtDate(resa.dateArrivee), fmtDate(resa.dateDepart))

  const instrLang = resa.logement?.instructionsArrivee?.[resa.client?.langue ?? 'fr']
    ?? resa.logement?.instructionsArrivee?.fr
    ?? ''

  const corps = `
    <p style="font-size:16px;margin:0 0 20px;">${t[type].intro}</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 24px;">
      ${ligne('Logement', logement)}
      ${ligne(t[type].arrivee, fmtDate(resa.dateArrivee))}
      ${ligne(t[type].depart, fmtDate(resa.dateDepart))}
      ${ligne('Voyageurs', `${resa.nbAdultes ?? 2} adulte(s)${resa.nbEnfants ? `, ${resa.nbEnfants} enfant(s)` : ''}`)}
      ${ligne(t[type].solde, `<strong>${fmtEur(resa.solde)}</strong>`)}
    </table>
    ${instrLang ? `
    <div style="background:#f0f7f3;border-left:4px solid #2a5843;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:24px;">
      <strong style="display:block;margin-bottom:8px;">${t[type].instructions}</strong>
      <p style="margin:0;white-space:pre-line;font-size:14px;">${instrLang}</p>
    </div>` : ''}
    <p style="font-size:14px;color:#6b7c6e;margin:0;">${t[type].contact}<br>
      <strong>${process.env.OWNER_EMAIL ?? ''}</strong>
    </p>`

  const html = emailHtml({
    titre: t[type].titre,
    preheader: subject,
    corps,
    footer: 'Domaine de la Source d\'Arimont · lasourcedarimont.be',
  })

  return { to: resa.client.email, subject, html }
}
```

- [ ] **Step 5 : Créer netlify/functions/emails/templates/reservation-annulee.js**

```js
// netlify/functions/emails/templates/reservation-annulee.js
import { emailHtml, fmtDate } from './_base.js'

export function reservationAnnulee(resa, t) {
  const type = 'reservation-annulee'
  const logement = resa.logementNom ?? resa.logement?.nom ?? '—'

  const corps = `
    <p style="font-size:16px;margin:0 0 16px;">${t[type].intro}</p>
    <p style="margin:0 0 16px;">${t[type].remboursement}</p>
    <p style="margin:0 0 24px;">${t[type].invitation}</p>
    <p style="font-size:14px;color:#6b7c6e;margin:0;">${t[type].contact}<br>
      <strong>${process.env.OWNER_EMAIL ?? ''}</strong>
    </p>`

  const html = emailHtml({
    titre: t[type].titre,
    preheader: t[type].subject,
    corps,
    footer: 'Domaine de la Source d\'Arimont · lasourcedarimont.be',
  })

  return { to: resa.client.email, subject: t[type].subject, html }
}
```

- [ ] **Step 6 : Créer netlify/functions/emails/templates/avant-arrivee.js**

```js
// netlify/functions/emails/templates/avant-arrivee.js
import { emailHtml, ligne, fmtDate, fmtEur } from './_base.js'

export function avantArrivee(resa, t, extra = {}) {
  const type = 'avant-arrivee'
  const jours = extra.jours ?? 7
  const logement = resa.logementNom ?? resa.logement?.nom ?? '—'
  const subject = t[type].subject(logement, jours)

  const instrLang = resa.logement?.instructionsArrivee?.[resa.client?.langue ?? 'fr']
    ?? resa.logement?.instructionsArrivee?.fr
    ?? ''

  const infos = extra.infosPropriete ?? {}
  const langue = resa.client?.langue ?? 'fr'
  const reglement = infos.reglement?.[langue] ?? infos.reglement?.fr ?? ''

  const corps = `
    <p style="font-size:16px;margin:0 0 20px;">${t[type].intro}</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 24px;">
      ${ligne('Logement', logement)}
      ${ligne(t[type].arrivee ?? 'Arrivée', fmtDate(resa.dateArrivee))}
      ${ligne(t[type].depart ?? 'Départ', fmtDate(resa.dateDepart))}
      ${ligne(t[type].solde, `<strong style="color:#2a5843;">${fmtEur(resa.solde)}</strong>`)}
      ${infos.adresse ? ligne(t[type].adresse, infos.adresse) : ''}
      ${infos.heureArrivee ? ligne(t[type].heureArrivee, infos.heureArrivee) : ''}
      ${infos.heureDepart ? ligne(t[type].heureDepart, infos.heureDepart) : ''}
    </table>
    ${instrLang ? `
    <div style="background:#f0f7f3;border-left:4px solid #2a5843;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:24px;">
      <strong style="display:block;margin-bottom:8px;">${t[type].instructions}</strong>
      <p style="margin:0;white-space:pre-line;font-size:14px;">${instrLang}</p>
    </div>` : ''}
    <p style="font-size:14px;color:#6b7c6e;margin:0;">${t[type].contact}<br>
      <strong>${infos.telephone ?? process.env.OWNER_EMAIL ?? ''}</strong>
    </p>`

  const html = emailHtml({
    titre: t[type].titre,
    preheader: subject,
    corps,
    footer: 'Domaine de la Source d\'Arimont · lasourcedarimont.be',
  })

  return { to: resa.client.email, subject, html }
}
```

- [ ] **Step 7 : Commit**

```bash
git add netlify/functions/emails/
git commit -m "feat: templates email HTML (5 déclencheurs, FR/NL/EN)"
```

---

## Task 11 : Lib emails — sendEmail() + câblage dans les functions

**Files:**
- Create: `netlify/functions/lib/emails.js`
- Modify: `netlify/functions/stripe-webhook.js`
- Modify: `netlify/functions/confirmer.js`
- Modify: `netlify/functions/refuser.js`

- [ ] **Step 1 : Créer netlify/functions/lib/emails.js**

```js
// netlify/functions/lib/emails.js
import { Resend } from 'resend'
import fr from '../emails/i18n/fr.js'
import nl from '../emails/i18n/nl.js'
import en from '../emails/i18n/en.js'
import { demandeRecue } from '../emails/templates/demande-recue.js'
import { nouvelleReservation } from '../emails/templates/nouvelle-reservation.js'
import { reservationConfirmee } from '../emails/templates/reservation-confirmee.js'
import { reservationAnnulee } from '../emails/templates/reservation-annulee.js'
import { avantArrivee } from '../emails/templates/avant-arrivee.js'

const resend = new Resend(process.env.RESEND_API_KEY)

const TRANSLATIONS = { fr, nl, en }

const TEMPLATES = {
  'demande-recue': demandeRecue,
  'nouvelle-reservation': nouvelleReservation,
  'reservation-confirmee': reservationConfirmee,
  'reservation-annulee': reservationAnnulee,
  'avant-arrivee': avantArrivee,
}

const FROM = "Domaine de la Source d'Arimont <reservations@lasourcedarimont.be>"

/**
 * @param {'demande-recue'|'nouvelle-reservation'|'reservation-confirmee'|'reservation-annulee'|'avant-arrivee'} type
 * @param {object} resa  - Document Sanity reservation
 * @param {object} extra - Données supplémentaires (siteUrl, jours, infosPropriete)
 */
export async function sendEmail(type, resa, extra = {}) {
  const template = TEMPLATES[type]
  if (!template) throw new Error(`Template email inconnu: ${type}`)

  // L'email propriétaire est toujours en français
  const langue = type === 'nouvelle-reservation' ? 'fr' : (resa.client?.langue ?? 'fr')
  const t = TRANSLATIONS[langue] ?? TRANSLATIONS.fr

  const { to, subject, html } = template(resa, t, extra)

  if (!to) throw new Error(`Destinataire manquant pour email type: ${type}`)

  const result = await resend.emails.send({ from: FROM, to, subject, html })

  if (result.error) {
    console.error(`Resend error [${type}]:`, result.error)
    throw new Error(`Erreur Resend: ${result.error.message}`)
  }

  return result
}
```

- [ ] **Step 2 : Décommenter sendEmail dans stripe-webhook.js**

Dans `netlify/functions/stripe-webhook.js`, remplacer les lignes commentées :

```js
// Remplacer :
// import { sendEmail } from './lib/emails.js'  // décommenté en Task 11
// ...
// await Promise.all([
//   sendEmail('demande-recue', resa),
//   sendEmail('nouvelle-reservation', resa, { siteUrl }),
// ])

// Par :
import { sendEmail } from './lib/emails.js'
// ...
const siteUrl = process.env.SITE_URL
await Promise.all([
  sendEmail('demande-recue', resa),
  sendEmail('nouvelle-reservation', resa, { siteUrl }),
])
```

Le fichier complet mis à jour :

```js
// netlify/functions/stripe-webhook.js
import Stripe from 'stripe'
import { sanity } from './lib/sanity.js'
import { sendEmail } from './lib/emails.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const sig = event.headers['stripe-signature']
  let stripeEvent

  try {
    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body, 'base64').toString('utf8')
      : event.body
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (e) {
    console.error('Stripe webhook signature invalide:', e.message)
    return { statusCode: 400, body: `Webhook Error: ${e.message}` }
  }

  if (stripeEvent.type === 'payment_intent.succeeded') {
    const pi = stripeEvent.data.object
    const piId = pi.id

    const resa = await sanity.fetch(
      `*[_type == "reservation" && stripePaymentIntentId == $piId][0]{
        ...,
        "logementNom": logement->nom,
        logement->{ _id, nom, instructionsArrivee }
      }`,
      { piId }
    )

    if (!resa) {
      console.error('Réservation introuvable pour PI:', piId)
      return { statusCode: 200, body: 'OK' }
    }

    await sanity.patch(resa._id).set({ statut: 'demande' }).commit()

    const siteUrl = process.env.SITE_URL
    try {
      await Promise.all([
        sendEmail('demande-recue', resa),
        sendEmail('nouvelle-reservation', resa, { siteUrl }),
      ])
    } catch (e) {
      console.error('Erreur envoi emails:', e.message)
      // Ne pas bloquer : la résa est déjà créée
    }

    console.log(`Réservation ${resa._id} passée en "demande", emails envoyés`)
  }

  return { statusCode: 200, body: 'OK' }
}
```

- [ ] **Step 3 : Décommenter sendEmail dans confirmer.js**

Dans `netlify/functions/confirmer.js`, remplacer :

```js
// Remplacer :
// import { sendEmail } from './lib/emails.js'  // décommenté en Task 11
// await sendEmail('reservation-confirmee', resa)

// Par — ajouter l'import en haut :
import { sendEmail } from './lib/emails.js'

// Et activer l'appel après le patch :
try {
  await sendEmail('reservation-confirmee', resa)
} catch (e) {
  console.error('Erreur email confirmation:', e.message)
}
```

- [ ] **Step 4 : Décommenter sendEmail dans refuser.js**

Dans `netlify/functions/refuser.js`, même opération :

```js
// Ajouter l'import :
import { sendEmail } from './lib/emails.js'

// Activer l'appel après le patch :
try {
  await sendEmail('reservation-annulee', resa)
} catch (e) {
  console.error('Erreur email annulation:', e.message)
}
```

- [ ] **Step 5 : Test end-to-end (mode test Stripe)**

```bash
# Terminal 1
npx netlify dev

# Terminal 2
stripe listen --forward-to http://localhost:8888/api/stripe-webhook

# Terminal 3 : créer une résa de test
curl -X POST http://localhost:8888/api/reservation \
  -H "Content-Type: application/json" \
  -d '{"logementId":"<ID>","arrivee":"2026-09-10","depart":"2026-09-14","nbAdultes":2,"nbEnfants":0,"langue":"fr","prenom":"Test","nom":"Email","email":"<votre email>","montantTotal":530,"montantAcompte":159}'
```

Puis utiliser le `clientSecret` retourné avec la [Stripe test card](https://stripe.com/docs/testing) `4242 4242 4242 4242` pour déclencher le paiement. Vérifier :
1. Email "Demande reçue" reçu à l'adresse client
2. Email "Nouvelle résa" reçu à OWNER_EMAIL avec boutons [Confirmer] [Refuser]
3. Cliquer [Confirmer] → email "Réservation confirmée" reçu

- [ ] **Step 6 : Commit**

```bash
git add netlify/functions/lib/emails.js \
        netlify/functions/stripe-webhook.js \
        netlify/functions/confirmer.js \
        netlify/functions/refuser.js
git commit -m "feat: sendEmail() câblé dans toutes les functions + test e2e"
```

---

## Vérification finale — self-review du plan

**Spec coverage :**

| Exigence spec | Task couverte |
|---------------|---------------|
| Sanity schemas (5 types) | Task 2 |
| Moteur tarification nuit/nuit | Task 4 |
| Vérif dispo 2× (affichage + checkout) | Task 5 + Task 6 |
| Payment Intent Stripe | Task 6 |
| Stripe webhook → statut "demande" | Task 7 |
| Tokens confirm/refus 64-char | Task 3 |
| Function confirmer + remboursement | Task 8 |
| 5 templates email + i18n FR/NL/EN | Tasks 9, 10, 11 |
| sendEmail() avec langue client | Task 11 |
| Signature webhook vérifiée | Task 7 |
| PI annulé si Sanity create fail | Task 6 |

**Non couvert dans ce plan (Plan B) :**
- iCal outbound `/api/ical/:logementId`
- Sync inbound Booking.com (cron)
- Cron expiration des demandes (rappel 2h + remboursement 24h)
- Email `avant-arrivee` (cron 7j avant arrivée)
- Finalisation frontend `reservation.html`
- Page `confirmation.html`
