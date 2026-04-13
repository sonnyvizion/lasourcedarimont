// Sanity Studio — schéma tarifSaison
// Tarifs structurés par période et par logement, utilisés pour le calcul automatique
// du prix lors d'une réservation (distinct de grilleTarifaire qui est purement éditorial).
// À placer dans schemas/tarifSaison.js de votre projet Sanity Studio

import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'tarifSaison',
  title: 'Tarif / Saison',
  type: 'document',
  groups: [
    { name: 'periode',   title: 'Période' },
    { name: 'prix',      title: 'Prix' },
    { name: 'conditions', title: 'Conditions' },
  ],
  fields: [
    // ── Identification ────────────────────────────────────────
    defineField({
      name: 'nom',
      title: 'Nom de la période',
      description: 'Ex : "Haute saison été", "Basse saison", "Noël / Nouvel An"',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'logement',
      title: 'Logement',
      type: 'reference',
      to: [{ type: 'logement' }],
      description: 'Laisser vide pour appliquer à tous les logements (tarif global)',
      group: 'periode',
    }),

    // ── Période ───────────────────────────────────────────────
    defineField({
      name: 'dateDebut',
      title: 'Date de début',
      type: 'date',
      options: { dateFormat: 'DD/MM/YYYY' },
      group: 'periode',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'dateFin',
      title: 'Date de fin',
      type: 'date',
      options: { dateFormat: 'DD/MM/YYYY' },
      group: 'periode',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'priorite',
      title: 'Priorité',
      description: 'En cas de chevauchement, le tarif avec la priorité la plus haute s\'applique (1 = le plus prioritaire)',
      type: 'number',
      initialValue: 10,
      group: 'periode',
      validation: Rule => Rule.required().min(1),
    }),

    // ── Prix ──────────────────────────────────────────────────
    defineField({
      name: 'prixParNuit',
      title: 'Prix par nuit (€)',
      type: 'number',
      group: 'prix',
      validation: Rule => Rule.required().min(0),
    }),
    defineField({
      name: 'prixWeekend',
      title: 'Prix par nuit — week-end (€)',
      description: 'Vendredi et samedi soir. Laisser vide si identique au prix standard.',
      type: 'number',
      group: 'prix',
    }),
    defineField({
      name: 'fraisMenage',
      title: 'Frais de ménage (€)',
      description: 'Montant fixe ajouté une seule fois par séjour. Laisser vide si inclus.',
      type: 'number',
      group: 'prix',
    }),
    defineField({
      name: 'taxeSejour',
      title: 'Taxe de séjour (€ / personne / nuit)',
      type: 'number',
      group: 'prix',
    }),

    // ── Conditions ────────────────────────────────────────────
    defineField({
      name: 'dureeMinNuits',
      title: 'Durée minimale (nuits)',
      type: 'number',
      initialValue: 1,
      group: 'conditions',
      validation: Rule => Rule.min(1),
    }),
    defineField({
      name: 'dureeMaxNuits',
      title: 'Durée maximale (nuits)',
      description: 'Laisser vide si pas de limite',
      type: 'number',
      group: 'conditions',
    }),
    defineField({
      name: 'joursArriveeAutorises',
      title: 'Jours d\'arrivée autorisés',
      description: 'Laisser vide pour autoriser tous les jours',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Lundi',    value: 'lundi' },
          { title: 'Mardi',    value: 'mardi' },
          { title: 'Mercredi', value: 'mercredi' },
          { title: 'Jeudi',    value: 'jeudi' },
          { title: 'Vendredi', value: 'vendredi' },
          { title: 'Samedi',   value: 'samedi' },
          { title: 'Dimanche', value: 'dimanche' },
        ],
        layout: 'grid',
      },
      group: 'conditions',
    }),
    defineField({
      name: 'acomptePercent',
      title: 'Acompte (%)',
      description: 'Pourcentage du montant total demandé à la réservation. Défaut : 30%',
      type: 'number',
      initialValue: 30,
      group: 'conditions',
      validation: Rule => Rule.min(0).max(100),
    }),
  ],

  preview: {
    select: {
      nom: 'nom',
      dateDebut: 'dateDebut',
      dateFin: 'dateFin',
      prixParNuit: 'prixParNuit',
      logement: 'logement.slug.current',
    },
    prepare({ nom, dateDebut, dateFin, prixParNuit, logement }) {
      return {
        title: nom,
        subtitle: `${dateDebut} → ${dateFin} · ${prixParNuit ?? '?'}€/nuit${logement ? ` · ${logement}` : ' · tous logements'}`,
      }
    },
  },
})
