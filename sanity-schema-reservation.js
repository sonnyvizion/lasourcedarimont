// Sanity Studio — schéma reservation
// À placer dans schemas/reservation.js de votre projet Sanity Studio
// Ajouter 'reservation' dans l'index des schémas (schemas/index.js ou sanity.config.ts)

import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'reservation',
  title: 'Réservation',
  type: 'document',
  groups: [
    { name: 'sejour',   title: 'Séjour' },
    { name: 'client',   title: 'Client' },
    { name: 'paiement', title: 'Paiement' },
    { name: 'meta',     title: 'Informations internes' },
  ],
  fields: [
    // ── Séjour ────────────────────────────────────────────────
    defineField({
      name: 'logement',
      title: 'Logement',
      type: 'reference',
      to: [{ type: 'logement' }],
      group: 'sejour',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'dateArrivee',
      title: 'Date d\'arrivée',
      type: 'date',
      options: { dateFormat: 'DD/MM/YYYY' },
      group: 'sejour',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'dateDepart',
      title: 'Date de départ',
      type: 'date',
      options: { dateFormat: 'DD/MM/YYYY' },
      group: 'sejour',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'nbAdultes',
      title: 'Nombre d\'adultes',
      type: 'number',
      group: 'sejour',
      validation: Rule => Rule.required().min(1),
    }),
    defineField({
      name: 'nbEnfants',
      title: 'Nombre d\'enfants',
      type: 'number',
      initialValue: 0,
      group: 'sejour',
    }),
    defineField({
      name: 'nbNuits',
      title: 'Nombre de nuits',
      type: 'number',
      group: 'sejour',
      readOnly: true,
    }),

    // ── Client ────────────────────────────────────────────────
    defineField({
      name: 'prenom',
      title: 'Prénom',
      type: 'string',
      group: 'client',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'nom',
      title: 'Nom',
      type: 'string',
      group: 'client',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      group: 'client',
      validation: Rule => Rule.required().email(),
    }),
    defineField({
      name: 'telephone',
      title: 'Téléphone',
      type: 'string',
      group: 'client',
    }),
    defineField({
      name: 'pays',
      title: 'Pays',
      type: 'string',
      group: 'client',
    }),
    defineField({
      name: 'messageClient',
      title: 'Message du client',
      type: 'text',
      rows: 4,
      group: 'client',
    }),

    // ── Paiement ──────────────────────────────────────────────
    defineField({
      name: 'montantTotal',
      title: 'Montant total (€)',
      type: 'number',
      group: 'paiement',
      validation: Rule => Rule.required().min(0),
    }),
    defineField({
      name: 'montantAcompte',
      title: 'Acompte (€)',
      type: 'number',
      group: 'paiement',
    }),
    defineField({
      name: 'stripePaymentIntentId',
      title: 'Stripe Payment Intent ID',
      type: 'string',
      group: 'paiement',
      readOnly: true,
    }),
    defineField({
      name: 'statutPaiement',
      title: 'Statut paiement',
      type: 'string',
      group: 'paiement',
      options: {
        list: [
          { title: 'En attente', value: 'en_attente' },
          { title: 'Acompte payé', value: 'acompte_paye' },
          { title: 'Soldé', value: 'solde' },
          { title: 'Remboursé', value: 'rembourse' },
        ],
        layout: 'radio',
      },
      initialValue: 'en_attente',
    }),

    // ── Informations internes ─────────────────────────────────
    defineField({
      name: 'statut',
      title: 'Statut réservation',
      type: 'string',
      group: 'meta',
      options: {
        list: [
          { title: 'Demande reçue', value: 'demande' },
          { title: 'Confirmée', value: 'confirmee' },
          { title: 'Annulée', value: 'annulee' },
          { title: 'Terminée', value: 'terminee' },
        ],
        layout: 'radio',
      },
      initialValue: 'demande',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      group: 'meta',
      options: {
        list: [
          { title: 'Site web', value: 'site' },
          { title: 'Booking.com', value: 'booking' },
          { title: 'Airbnb', value: 'airbnb' },
          { title: 'Téléphone', value: 'telephone' },
          { title: 'Autre', value: 'autre' },
        ],
      },
      initialValue: 'site',
    }),
    defineField({
      name: 'noteInterne',
      title: 'Note interne',
      type: 'text',
      rows: 3,
      group: 'meta',
    }),
    defineField({
      name: 'icalUid',
      title: 'iCal UID (sync Booking)',
      type: 'string',
      group: 'meta',
      readOnly: true,
    }),
  ],

  preview: {
    select: {
      prenom: 'prenom',
      nom: 'nom',
      dateArrivee: 'dateArrivee',
      dateDepart: 'dateDepart',
      statut: 'statut',
      logement: 'logement.slug.current',
    },
    prepare({ prenom, nom, dateArrivee, dateDepart, statut, logement }) {
      const statutLabel = {
        demande: '🟡',
        confirmee: '🟢',
        annulee: '🔴',
        terminee: '⚫',
      }
      return {
        title: `${prenom ?? ''} ${nom ?? ''}`.trim() || 'Sans nom',
        subtitle: `${dateArrivee} → ${dateDepart} · ${logement ?? ''} ${statutLabel[statut] ?? ''}`,
      }
    },
  },
})
