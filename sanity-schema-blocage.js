// Sanity Studio — schéma blocage
// Représente une période indisponible importée depuis Booking.com, Airbnb ou bloquée manuellement.
// À placer dans schemas/blocage.js de votre projet Sanity Studio

import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'blocage',
  title: 'Blocage / Indisponibilité',
  type: 'document',
  fields: [
    defineField({
      name: 'logement',
      title: 'Logement',
      type: 'reference',
      to: [{ type: 'logement' }],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'dateDebut',
      title: 'Date de début',
      type: 'date',
      options: { dateFormat: 'DD/MM/YYYY' },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'dateFin',
      title: 'Date de fin',
      type: 'date',
      options: { dateFormat: 'DD/MM/YYYY' },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      options: {
        list: [
          { title: 'Booking.com', value: 'booking' },
          { title: 'Airbnb', value: 'airbnb' },
          { title: 'Manuel', value: 'manuel' },
        ],
        layout: 'radio',
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'icalUid',
      title: 'iCal UID',
      description: 'Identifiant unique de l\'événement iCal (pour éviter les doublons lors de la sync)',
      type: 'string',
    }),
    defineField({
      name: 'titre',
      title: 'Titre / Référence',
      description: 'Ex: "Réservation Booking #12345" ou "Blocage propriétaire"',
      type: 'string',
    }),
  ],

  preview: {
    select: {
      source: 'source',
      dateDebut: 'dateDebut',
      dateFin: 'dateFin',
      titre: 'titre',
      logement: 'logement.slug.current',
    },
    prepare({ source, dateDebut, dateFin, titre, logement }) {
      const icon = { booking: '🔵', airbnb: '🔴', manuel: '⚫' }
      return {
        title: titre || `Blocage ${source ?? ''}`,
        subtitle: `${dateDebut} → ${dateFin} · ${logement ?? ''} ${icon[source] ?? ''}`,
      }
    },
  },
})
