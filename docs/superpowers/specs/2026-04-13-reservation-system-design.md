# Système de réservation directe — Design complet
**Statut : DESIGN VALIDÉ — prêt pour implémentation**
**Date : 2026-04-13 / 2026-04-14**

---

## Contexte

Système de réservation directe pour le Domaine de la Source d'Arimont.
7 logements : 5 gîtes + 2 chambres (capacités : 9, 6, 6, 6, 4, 2, 2 personnes).
Le client utilise aussi Booking.com et veut éviter les doublons.

---

## Décisions validées

| Sujet | Décision |
|-------|----------|
| Approche technique | DIY full-stack (Approche 1) |
| Paiement | Acompte 30% via Stripe (modifiable) |
| Confirmation | Modèle "en attente" — email propriétaire avec [Confirmer]/[Refuser] |
| Gestion admin | Sanity Studio + liens rapides dans l'email |
| Sync iCal | Cron 30min + sync fraîche au checkout |
| Emails | Resend (free tier) |

---

## Stack retenue

- **Netlify Functions** — serverless backend (déjà configuré dans netlify.toml)
- **Sanity** — base de données (schémas définis en Section 8)
- **Stripe** — paiement (1.5% + 0.25€/transaction, cartes européennes)
- **Resend** — emails transactionnels (FR/NL/EN)
- **iCal** — sync bidirectionnelle avec Booking.com

---

## Présentation client (validée)

> **Système de réservation directe — Domaine de la Source d'Arimont**
>
> - Calendrier en temps réel synchronisé avec Booking.com (anti-doublon)
> - **Paiement sécurisé par carte (Stripe)** — vous recevez l'argent directement sur votre compte. Stripe prend **1.5% + 0.25€ par transaction** (ex: sur un acompte de €180 → ~€3 de frais). Aucune donnée bancaire ne transite par le site.
> - Tarification automatique par saison, durée de séjour, week-end
> - **Confirmation par email en 2 étapes pour éviter tout doublon** : le client reçoit d'abord un email "demande reçue", vous recevez une notification avec un bouton "Confirmer" ou "Refuser" en un clic. La confirmation définitive (avec reçu de paiement) n'est envoyée au client qu'après votre validation. En cas de doublon exceptionnel avec Booking.com, vous pouvez refuser et le client est remboursé intégralement.
> - Vous gérez tout depuis votre tableau de bord (Sanity Studio) ou directement depuis votre boîte mail
> - **Zéro commission sur vos réservations directes**
>
> *Booking.com reste actif pour la visibilité, mais chaque client qui réserve en direct vous fait économiser 15 à 25%.*
>
> **Investissement : €200/mois les 3 premiers mois, puis €300/mois**
> *(ou €4,000 en one-shot + €100/mois de maintenance)*

---

## Section 1 — Architecture générale (validée)

```
┌─────────────────────────────────────────────────────┐
│                   Site statique (Netlify)            │
│  reservation.html → src/reservation.js              │
│  • Sélecteur de logement + calendrier                │
│  • Calcul du prix en temps réel                      │
│  • Formulaire client + paiement Stripe               │
└───────────────┬─────────────────────────────────────┘
                │ appels API
┌───────────────▼─────────────────────────────────────┐
│            Netlify Functions (serverless)            │
│                                                      │
│  /api/disponibilite   → vérifie dispo + sync iCal   │
│  /api/tarif           → calcule le prix              │
│  /api/reservation     → crée résa + Payment Intent  │
│  /api/stripe-webhook  → confirme paiement            │
│  /api/confirmer/:token → propriétaire confirme       │
│  /api/refuser/:token  → propriétaire refuse          │
│  /api/ical/:logementId → flux iCal pour Booking.com  │
│                                                      │
│  [CRON toutes les 30min]                             │
│  /api/sync-ical       → sync Booking.com → Sanity   │
│  /api/sync-expirations → rappels + remboursements    │
└───────────┬───────────────────────────────┬─────────┘
            │                               │
┌───────────▼──────────┐      ┌─────────────▼────────┐
│   Sanity (BDD)       │      │   Services externes   │
│                      │      │                       │
│  • reservations      │      │  • Stripe (paiement)  │
│  • blocages          │      │  • Resend (emails)    │
│  • tarifSaisons      │      │  • Booking.com (iCal) │
│  • logements         │      │                       │
│  • infosPropriete    │      │                       │
└──────────────────────┘      └───────────────────────┘
```

Sync iCal bidirectionnelle :
- **Booking → Site** : cron 30min + sync fraîche au checkout
- **Site → Booking** : endpoint `/api/ical/:logementId` à configurer dans le back-office Booking.com

---

## Section 2 — Parcours de réservation (validée)

```
CLIENT                          SITE                         PROPRIÉTAIRE
  │                               │                               │
  │  1. Choisit un logement       │                               │
  │  2. Sélectionne dates         │                               │
  │──────────────────────────────▶│                               │
  │                               │  → sync iCal fraîche          │
  │                               │  → calcul prix (tarifSaison)  │
  │◀──────────────────────────────│                               │
  │  3. Voit le prix détaillé     │                               │
  │     (nuits + frais + taxes)   │                               │
  │                               │                               │
  │  4. Remplit formulaire        │                               │
  │     (nom, email, tél, pays)   │                               │
  │──────────────────────────────▶│                               │
  │                               │  → vérifie dispo une 2e fois  │
  │                               │  → crée Payment Intent Stripe │
  │  5. Paie l'acompte (30%)      │                               │
  │──────────────────────────────▶│                               │
  │                               │  → Stripe webhook reçu        │
  │                               │  → résa créée dans Sanity     │
  │                               │     statut: "demande"         │
  │◀──────────────────────────────│                               │
  │  6. Email "Demande reçue"     │──────────────────────────────▶│
  │     "Confirmation sous 1h"    │     Email "Nouvelle résa"     │
  │                               │     [Confirmer] [Refuser]     │
  │                               │                               │
  │                               │◀──────────────────────────────│
  │                               │  7a. Clic "Confirmer"         │
  │                               │   → statut: "confirmée"       │
  │◀──────────────────────────────│   → iCal site mis à jour      │
  │  Email "Réservation confirmée"│                               │
  │  (récap séjour + solde dû)    │                               │
  │                               │                               │
  │                               │◀──────────────────────────────│
  │                               │  7b. Clic "Refuser"           │
  │                               │   → Stripe remboursement auto │
  │◀──────────────────────────────│   → statut: "annulée"         │
  │  Email "Remboursement"        │                               │
  │  + explication + contact      │                               │
```

Points clés :
- Dispo vérifiée 2 fois : à l'affichage du prix ET juste avant le paiement
- Si dates prises entre les deux → erreur avant paiement (pas de remboursement)
- Remboursement en cas de refus = automatique via API Stripe

---

## Section 3 — Moteur de tarification (validée)

Algorithme nuit par nuit :
```
Pour chaque nuit du séjour :
  1. Trouver tous les tarifSaison qui couvrent cette nuit
  2. Garder celui avec la priorité la plus haute (1 = gagne)
  3. Si vendredi ou samedi soir → prixWeekend (si défini)
  4. Additionner

Puis ajouter (une seule fois) :
  + fraisMenage
  + taxeSejour × nbPersonnes × nbNuits

→ Total séjour
→ Acompte = Total × acomptePercent (défaut 30%)
→ Solde = Total − Acompte
```

---

## Section 4 — Emails (validée)

### 5 déclencheurs

| # | Clé | Destinataire | Moment | Langue |
|---|-----|--------------|--------|--------|
| 1 | `demande-recue` | Client | Stripe webhook reçu | FR/NL/EN (choix client) |
| 2 | `nouvelle-reservation` | Propriétaire | Stripe webhook reçu | FR (toujours) |
| 3 | `reservation-confirmee` | Client | Clic [Confirmer] | FR/NL/EN |
| 4 | `reservation-annulee` | Client | Clic [Refuser] | FR/NL/EN |
| 5 | `avant-arrivee` | Client | 7 jours avant l'arrivée (cron) | FR/NL/EN |

### Contenu de chaque email

**1 — `demande-recue` (Client)**
```
Objet : Votre demande de réservation — [Logement], [dates]

- Récapitulatif : logement, dates, nb personnes
- Acompte payé : montant + 4 derniers chiffres carte
- Solde restant à régler
- Message rassurant : "Confirmation sous 1h"
- Contact propriétaire (en cas d'urgence)
```

**2 — `nouvelle-reservation` (Propriétaire, FR)**
```
Objet : Nouvelle demande — [Logement] du [date arrivée] au [date départ]

- Nom, email, tél, pays du client
- Logement + dates + nb personnes
- Acompte reçu (montant)
- Bouton [✓ Confirmer] → /api/confirmer/:token
- Bouton [✗ Refuser]  → /api/refuser/:token
- Lien vers Sanity Studio (réservation directe)
```

**3 — `reservation-confirmee` (Client)**
```
Objet : Réservation confirmée — [Logement], [dates]

- Confirmation officielle avec récapitulatif complet
- Acompte payé + solde restant (à régler sur place)
- Adresse + GPS (infos communes)
- Instructions spécifiques au logement (code accès, clé)
- Règlement de la maison (lien ou résumé)
- Contact propriétaire
```

**4 — `reservation-annulee` (Client)**
```
Objet : Votre demande n'a pas pu être confirmée

- Message d'excuse (ton chaleureux, pas de justification imposée)
- Confirmation du remboursement intégral (délai 5-10 jours)
- Invitation à recommencer pour d'autres dates
- Contact propriétaire
```

**5 — `avant-arrivee` (Client)**
```
Objet : Votre séjour approche — [Logement], dans 7 jours

- Rappel : dates + logement + nb personnes
- Solde à régler sur place : montant exact
- Infos d'arrivée spécifiques au logement (code, clé, accès)
- Infos communes : adresse, GPS, parking
- Règlement + heures d'arrivée/départ
- Contact propriétaire (téléphone)
```

### Architecture des templates

```
src/emails/
├── templates/
│   ├── demande-recue.js
│   ├── nouvelle-reservation.js
│   ├── reservation-confirmee.js
│   ├── reservation-annulee.js
│   └── avant-arrivee.js
└── i18n/
    ├── fr.js
    ├── nl.js
    └── en.js
```

Chaque template est une fonction `(data, t) => htmlString`. La fonction `sendEmail(type, reservationData)` dans les Netlify Functions :
1. Récupère la langue depuis `reservation.client.langue`
2. Charge les traductions correspondantes
3. Appelle le template avec les données + traductions
4. Envoie via Resend

### Infos pratiques dans Sanity (mixte)

- **Singleton `infosPropriete`** : adresse, GPS, téléphone, règlement, heures arrivée/départ
- **Champ `instructionsArrivee` sur `logement`** : code de porte, localisation clé, spécificités — en FR/NL/EN

---

## Section 5 — Sync iCal (validée)

### Vue d'ensemble

```
Booking.com                   Site (Netlify)                 Sanity
    │                              │                             │
    │   [cron 30min]               │                             │
    │◀─────────────────────────────│  GET iCal feed/logement     │
    │──────────────────────────────▶│  VEVENT[]                   │
    │                              │  → parse + classify         │
    │                              │  → upsert blocage/resa      │──▶ Sanity
    │                              │                             │
    │   [checkout client]          │                             │
    │◀─────────────────────────────│  GET iCal feed/logement     │
    │──────────────────────────────▶│  (sync fraîche)             │
    │                              │  → vérif dispo temps réel   │
    │                              │                             │
    │◀─────────────────────────────│  GET /api/ical/:logementId  │
    │   flux iCal site             │  ← réservations confirmées  │◀── Sanity
    │   (configuré dans Booking)   │  ← blocages                 │
```

### Algorithme de sync inbound (Booking → Sanity)

```
Pour chaque logement :
  1. Fetch iCal URL Booking.com du logement
  2. Parser les VEVENT (lib: node-ical)
  3. Pour chaque VEVENT :

     a. Extraire : UID, DTSTART, DTEND, SUMMARY

     b. Classifier :
        - SUMMARY ressemble à un nom (≥2 mots non-bloquants) → reservation
        - SUMMARY = "Blocked" / vide / mot-clé bloquant → blocage

     c. Upsert dans Sanity via icalUid :
        - Document existant → patch si dates changées
        - Nouveau → créer

  4. Supprimer les docs Booking.com dont l'UID
     n'apparaît plus dans le feed (= annulation)
```

### Classification SUMMARY

```js
function classifierEvenement(summary) {
  if (!summary || summary.trim() === '') return 'blocage'
  const motsCles = ['blocked', 'closed', 'unavailable', 'not available', 'indisponible']
  if (motsCles.some(m => summary.toLowerCase().includes(m))) return 'blocage'
  if (summary.trim().split(/\s+/).length >= 2) return 'reservation'
  return 'blocage'
}
```

### Outbound : `/api/ical/:logementId`

Génère un flux iCal pour Booking.com. Inclut :
- Toutes les **réservations confirmées** (source: "direct")
- Tous les **blocages** (source: "manuel" ou "booking.com")

Les événements Booking.com réinclus sont ignorés silencieusement par Booking.com (déduplication par UID). Pas de boucle.

### Sync fraîche au checkout

Dans `/api/reservation`, avant la création du Payment Intent :
- Sync inbound pour le logement concerné uniquement
- Bloquant : conflit détecté → erreur 409, pas de paiement

### Gestion des erreurs

| Situation | Comportement |
|-----------|-------------|
| iCal Booking.com inaccessible | Log erreur, skip logement, retry au prochain cron |
| VEVENT avec dates invalides | Skip + log warning |
| Sanity write fail | Log erreur critique |
| Conflit au checkout | Erreur 409 → message "dates non disponibles" |

---

## Section 6 — Sécurité (validée)

### Tokens confirm/refus

```js
import { randomBytes } from 'crypto'
const token = randomBytes(32).toString('hex') // 64 chars hex
```

- Deux tokens distincts par résa : `tokenConfirmer` et `tokenRefuser`
- Stockés en clair dans Sanity (sécurité par entropie)
- **Usage unique** : à l'utilisation, les deux tokens passent à `null` simultanément au changement de statut

### Expiration des demandes (rappel + auto-remboursement)

Cron `/api/sync-expirations` toutes les 30min :

```
Pour chaque reservation { statut: "demande" } :

  Si maintenant ≥ creeA + 2h ET rappelEnvoye = false :
    → Email rappel propriétaire
    → rappelEnvoye = true dans Sanity

  Si maintenant ≥ creeA + 24h :
    → Remboursement Stripe (refund du paymentIntentId)
    → statut → "expiree"
    → Email client "demande expirée + remboursement"
    → tokenConfirmer, tokenRefuser → null
```

### Stripe — Sécurité webhook

```js
const event = stripe.webhooks.constructEvent(
  rawBody,    // corps brut, avant JSON.parse
  req.headers['stripe-signature'],
  process.env.STRIPE_WEBHOOK_SECRET
)
// Signature invalide → exception → 400, aucune action
```

### Variables d'environnement

| Variable | Utilisation |
|----------|------------|
| `STRIPE_SECRET_KEY` | API Stripe (server-side) |
| `STRIPE_WEBHOOK_SECRET` | Vérification signature webhook |
| `STRIPE_PUBLISHABLE_KEY` | Front-end (clé publique) |
| `RESEND_API_KEY` | Envoi d'emails |
| `SANITY_PROJECT_ID` | Identifiant projet Sanity |
| `SANITY_DATASET` | Dataset Sanity (`production`) |
| `SANITY_API_TOKEN` | Token Sanity write (server-side) |
| `SITE_URL` | Base URL pour liens confirm/refus |
| `OWNER_EMAIL` | Email destinataire email propriétaire |

### RGPD

- **Données collectées** : nom, email, téléphone, pays, dates, logement, langue, montants
- **Paiement** : géré par Stripe — site ne voit jamais les numéros de carte
- **Conservation** : données comptables 7 ans ; données personnelles **anonymisées après 1 an** (cron annuel : remplace nom/email/tél par `"[supprimé]"`)
- **Mentions** : "Vos données sont utilisées uniquement pour la gestion de votre séjour. [Politique de confidentialité]" au bas du formulaire
- **Page à créer** : Mentions légales / Confidentialité (déjà prévue dans CLAUDE.md)

---

## Section 7 — Interface de réservation (validée)

### Structure de la page `reservation.html`

```
reservation.html
├── Barre de progression (étapes 1→2→3→4)
├── Conteneur d'étapes (une seule visible à la fois)
│   ├── Étape 1 — Choisir un logement
│   ├── Étape 2 — Choisir les dates
│   ├── Étape 3 — Vos informations
│   └── Étape 4 — Paiement
└── Récapitulatif latéral (sticky desktop, bandeau mobile dès étape 2)
```

Bouton "Réserver" dans la nav → redirige vers `reservation.html` (pas de modale).

### Étape 1 — Choisir un logement

- Grille de 7 cartes : photo, nom, capacité, prix indicatif "à partir de X€/nuit"
- Filtre rapide par capacité (2, 4+, 6+)
- Données statiques (pré-chargées au build depuis Sanity ou hardcodées)

### Étape 2 — Choisir les dates

- Sélecteur double arrivée/départ avec dates indisponibles grisées
- Chargement des indisponibilités via `/api/disponibilite/:logementId`
- Calcul du prix en temps réel à chaque sélection complète (appel `/api/tarif`)
- Détail affiché : X nuits × tarif + ménage + taxe = Total + Acompte (30%)
- Erreur inline si dates deviennent indisponibles en cours de sélection

### Étape 3 — Vos informations

- Prénom + Nom, Email (+ confirmation), Téléphone, Pays, Nb personnes, Langue
- Case RGPD obligatoire
- Validation côté client uniquement, pas d'appel API

### Étape 4 — Paiement

- Récapitulatif complet en haut
- Appel `/api/reservation` → crée Payment Intent + résa statut `en_attente_paiement`
- Stripe Payment Element chargé avec le client secret
- Bouton "Payer €XXX" → `stripe.confirmPayment()`
- Succès → redirection `/confirmation.html?id=XXX`
- Erreur → message inline, pas de retour aux étapes précédentes

### Récapitulatif latéral

```
┌─────────────────────────┐
│  [Photo miniature]      │
│  Gîte des Sources       │
│  ─────────────────────  │
│  15 juin → 19 juin      │
│  4 nuits · 4 personnes  │
│  ─────────────────────  │
│  4 × 95€       = 380€   │
│  Ménage        =  50€   │
│  Taxe séjour   =   8€   │
│  ─────────────────────  │
│  Total séjour  = 438€   │
│  Acompte (30%) = 131€   │
└─────────────────────────┘
```

Mobile : bandeau collant en bas d'écran (montant + CTA "Continuer").

### Gestion d'état (vanilla JS)

```js
const state = {
  logementId: null,
  dateArrivee: null,
  dateDepart: null,
  nbPersonnes: null,
  langue: 'fr',
  prixDetail: null,
  clientInfo: {},
  etapeCourante: 1
}

function allerEtape(n) {
  // masque étape courante, affiche étape n,
  // met à jour barre de progression, scroll haut
}
```

---

## Section 8 — Schémas Sanity finaux (validée)

### 5 types de documents

| Type | Rôle |
|------|------|
| `logement` | Les 7 hébergements (gîtes + chambres) |
| `tarifSaison` | Grilles tarifaires par période |
| `reservation` | Réservations directes + Booking.com |
| `blocage` | Dates bloquées (manuel ou Booking.com) |
| `infosPropriete` | Singleton — infos communes à la propriété |

### `logement`

```
nom               string, required
slug              slug (source: nom)
capacite          number, required
description       { fr, nl, en }  — texte riche
photos            array<image>
actif             boolean, default true

fraisMenage       number — € forfait par séjour
taxeSejour        number — € par personne par nuit
acomptePercent    number, default 30
dureeMinNuits     number, optional

icalUrlBooking    string — URL feed iCal Booking.com

instructionsArrivee  { fr, nl, en }  — code porte, clé, accès
```

### `tarifSaison`

```
logement          reference → logement, required
nom               string — ex: "Été 2025"
dateDebut         date, required
dateFin           date, required
prixNuit          number, required
prixWeekend       number, optional
priorite          number, required — 1 = priorité max
```

### `reservation`

```
logement          reference → logement, required
source            'direct' | 'booking.com'
statut            'en_attente_paiement' | 'demande' |
                  'confirmee' | 'annulee' | 'expiree'

dateArrivee       date, required
dateDepart        date, required
nbPersonnes       number, required

client {
  nom             string
  email           string
  telephone       string
  pays            string
  langue          'fr' | 'nl' | 'en'
}

prixTotal         number
acompte           number
solde             number

stripePaymentIntentId  string
stripeRefundId         string, optional

tokenConfirmer    string, optional
tokenRefuser      string, optional

rappelEnvoye      boolean, default false
creeA             datetime

icalUid           string, optional  — si source booking.com
```

### `blocage`

```
logement          reference → logement, required
dateDebut         date, required
dateFin           date, required
source            'manuel' | 'booking.com'
icalUid           string, optional
note              string, optional
```

### `infosPropriete` (singleton, `_id: 'infosPropriete'`)

```
adresse           string
coordonneesGPS    string — ex: "50.1234, 5.6789"
telephone         string
emailContact      string
heureArrivee      string — ex: "15:00"
heureDepart       string — ex: "11:00"

reglement {
  fr              text
  nl              text
  en              text
}
```

### Index GROQ utiles

**Vérifier la disponibilité :**
```groq
*[
  (_type == "reservation" && logement._ref == $id &&
   statut in ["demande", "confirmee"] &&
   dateArrivee < $dateFin && dateDepart > $dateArrivee)
  ||
  (_type == "blocage" && logement._ref == $id &&
   dateDebut < $dateFin && dateFin > $dateArrivee)
]
```

**TarifSaisons pour une nuit, triés par priorité :**
```groq
*[_type == "tarifSaison" && logement._ref == $id
  && dateDebut <= $date && dateFin >= $date]
| order(priorite asc)
```

**Demandes non traitées depuis +2h (cron rappel) :**
```groq
*[_type == "reservation" && statut == "demande"
  && rappelEnvoye == false
  && dateTime(creeA) < dateTime(now()) - 60*60*2]
```
