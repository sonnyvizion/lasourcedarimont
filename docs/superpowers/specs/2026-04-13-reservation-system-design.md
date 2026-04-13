# Système de réservation directe — Design en cours
**Statut : BRAINSTORMING EN COURS — reprendre à la section 4**
**Date : 2026-04-13**

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
- **Sanity** — base de données (schémas déjà esquissés : reservation, blocage, tarifSaison)
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
└───────────┬───────────────────────────────┬─────────┘
            │                               │
┌───────────▼──────────┐      ┌─────────────▼────────┐
│   Sanity (BDD)       │      │   Services externes   │
│                      │      │                       │
│  • reservations      │      │  • Stripe (paiement)  │
│  • blocages          │      │  • Resend (emails)    │
│  • tarifSaisons      │      │  • Booking.com (iCal) │
│  • logements         │      │                       │
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

## À FAIRE — Sections restantes à designer

- [ ] **Section 4** — Emails (templates, langues FR/NL/EN, 5 déclencheurs)
- [ ] **Section 5** — Sync iCal (détail technique : cron, parsing, upsert Sanity)
- [ ] **Section 6** — Sécurité (tokens confirm/refus, secrets Stripe, RGPD)
- [ ] **Section 7** — Interface de réservation (UX page reservation.html)
- [ ] **Section 8** — Schémas Sanity finaux (ajustements par rapport aux fichiers existants)

---

## Pour reprendre cette session

Dire à Claude : *"Reprends le design du système de réservation, on en était à la section 4 — emails. Le fichier de contexte est dans docs/superpowers/specs/2026-04-13-reservation-system-design.md"*
