// Sanity Studio — schéma groupesSeminaires
// À placer dans schemas/groupesSeminaires.js de votre projet Sanity Studio
// Ajouter 'groupesSeminaires' dans l'index des schémas (schemas/index.js ou sanity.config.ts)

import { defineField, defineType } from 'sanity'

// Réutilisable : contenu riche (gras, italique/semi-italic)
const blockContent = defineField({
  name: 'content',
  type: 'array',
  of: [
    {
      type: 'block',
      styles: [],
      lists: [],
      marks: {
        decorators: [
          { title: 'Gras', value: 'strong' },
          { title: 'Italique / semi-italic', value: 'em' },
        ],
        annotations: [],
      },
    },
  ],
})

export default defineType({
  name: 'groupesSeminaires',
  title: 'Groupes & Séminaires',
  type: 'document',
  groups: [
    { name: 'intro',       title: 'Introduction' },
    { name: 'stats',       title: 'Statistiques' },
    { name: 'hebergements', title: 'Hébergements' },
    { name: 'salle',       title: 'Grande salle' },
    { name: 'combo',       title: 'Convivialité & intimité' },
    { name: 'infra',       title: 'Infrastructures' },
    { name: 'ideal',       title: 'Idéal pour' },
    { name: 'cta',         title: 'CTA final' },
  ],
  fields: [
    // Champ langue (requis par @sanity/document-internationalization)
    defineField({
      name: 'language',
      title: 'Langue',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),

    // ── INTRODUCTION ──────────────────────────────────────────────────────────
    defineField({
      name: 'introLabel',
      title: 'Label',
      type: 'string',
      group: 'intro',
      initialValue: 'Groupes & Séminaires',
    }),
    defineField({
      name: 'introTitle',
      title: 'Titre principal (h1)',
      ...blockContent,
      group: 'intro',
      description: 'Utilisez Italique pour les mots mis en valeur (ex : "35 personnes")',
    }),
    defineField({
      name: 'introLead',
      title: 'Texte d'accroche',
      ...blockContent,
      group: 'intro',
    }),
    defineField({
      name: 'introCta',
      title: 'Bouton principal — texte',
      type: 'string',
      group: 'intro',
      initialValue: 'Demander un devis',
    }),
    defineField({
      name: 'introCtaDiscover',
      title: 'Bouton secondaire — texte',
      type: 'string',
      group: 'intro',
      initialValue: 'Découvrir le domaine',
    }),

    // ── STATISTIQUES ──────────────────────────────────────────────────────────
    defineField({
      name: 'stats',
      title: 'Statistiques (bande chiffres clés)',
      type: 'object',
      group: 'stats',
      fields: [
        defineField({
          name: 'personnes',
          title: 'Stat 1 — Personnes',
          type: 'object',
          fields: [
            defineField({ name: 'number', title: 'Chiffre', type: 'string', initialValue: '35' }),
            defineField({ name: 'label',  title: 'Label',   type: 'string', initialValue: 'Personnes max.' }),
          ],
        }),
        defineField({
          name: 'hebergements',
          title: 'Stat 2 — Hébergements',
          type: 'object',
          fields: [
            defineField({ name: 'number', title: 'Chiffre', type: 'string', initialValue: '7' }),
            defineField({ name: 'label',  title: 'Label',   type: 'string', initialValue: 'Hébergements' }),
          ],
        }),
        defineField({
          name: 'couverts',
          title: 'Stat 3 — Couverts',
          type: 'object',
          fields: [
            defineField({ name: 'number', title: 'Chiffre', type: 'string', initialValue: '20' }),
            defineField({ name: 'label',  title: 'Label',   type: 'string', initialValue: 'Couverts' }),
          ],
        }),
        defineField({
          name: 'privatisable',
          title: 'Stat 4 — Privatisable',
          type: 'object',
          fields: [
            defineField({ name: 'number', title: 'Chiffre', type: 'string', initialValue: '100%' }),
            defineField({ name: 'label',  title: 'Label',   type: 'string', initialValue: 'Privatisable' }),
          ],
        }),
      ],
    }),

    // ── HÉBERGEMENTS ──────────────────────────────────────────────────────────
    defineField({
      name: 'hebergLabel',
      title: 'Label section',
      type: 'string',
      group: 'hebergements',
      initialValue: 'Des hébergements pensés pour se retrouver',
    }),
    defineField({
      name: 'hebergTitle',
      title: 'Titre (h2)',
      ...blockContent,
      group: 'hebergements',
    }),
    defineField({
      name: 'hebergDesc',
      title: 'Texte introductif',
      type: 'text',
      rows: 3,
      group: 'hebergements',
    }),
    defineField({
      name: 'hebergItems',
      title: 'Hébergements listés (max. 3)',
      type: 'array',
      group: 'hebergements',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title',       title: 'Titre',       type: 'string' }),
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
          ],
          preview: { select: { title: 'title', subtitle: 'description' } },
        },
      ],
      validation: (Rule) => Rule.max(3),
    }),
    defineField({
      name: 'hebergImageA',
      title: 'Photo principale (grand format)',
      type: 'image',
      group: 'hebergements',
      options: { hotspot: true },
    }),
    defineField({
      name: 'hebergImageB',
      title: 'Photo secondaire (petit format)',
      type: 'image',
      group: 'hebergements',
      options: { hotspot: true },
    }),

    // ── GRANDE SALLE ──────────────────────────────────────────────────────────
    defineField({
      name: 'salleLabel',
      title: 'Label section',
      type: 'string',
      group: 'salle',
      initialValue: 'Un grand espace convivial',
    }),
    defineField({
      name: 'salleTitle',
      title: 'Titre (h2)',
      ...blockContent,
      group: 'salle',
    }),
    defineField({
      name: 'salleText1',
      title: 'Paragraphe 1 (avec gras possible)',
      ...blockContent,
      group: 'salle',
      description: 'Ex : "La salle à manger peut accueillir **jusqu\'à 20 personnes**..."',
    }),
    defineField({
      name: 'salleText2',
      title: 'Paragraphe 2',
      type: 'text',
      rows: 3,
      group: 'salle',
    }),
    defineField({
      name: 'salleImage',
      title: 'Photo de la salle',
      type: 'image',
      group: 'salle',
      options: { hotspot: true },
    }),
    defineField({
      name: 'salleHighlightNumber',
      title: 'Chiffre mis en avant',
      type: 'string',
      group: 'salle',
      initialValue: '20',
    }),
    defineField({
      name: 'salleHighlightLabel',
      title: 'Label du chiffre (utilisez \\n pour saut de ligne)',
      type: 'string',
      group: 'salle',
      initialValue: 'Personnes\nà table',
    }),

    // ── CONVIVIALITÉ & INTIMITÉ ────────────────────────────────────────────────
    defineField({
      name: 'comboLabel',
      title: 'Label section',
      type: 'string',
      group: 'combo',
      initialValue: 'Le plaisir d'être ensemble',
    }),
    defineField({
      name: 'comboTitle',
      title: 'Titre (h2)',
      ...blockContent,
      group: 'combo',
    }),
    defineField({
      name: 'comboLead',
      title: 'Texte introductif',
      type: 'text',
      rows: 2,
      group: 'combo',
    }),
    defineField({
      name: 'comboCards',
      title: 'Cartes (max. 3)',
      type: 'array',
      group: 'combo',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title',       title: 'Titre (utilisez \\n pour saut de ligne)', type: 'string' }),
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
          ],
          preview: { select: { title: 'title', subtitle: 'description' } },
        },
      ],
      validation: (Rule) => Rule.max(3),
    }),

    // ── INFRASTRUCTURES ───────────────────────────────────────────────────────
    defineField({
      name: 'infraLabel',
      title: 'Label section',
      type: 'string',
      group: 'infra',
      initialValue: 'Infrastructures adaptées aux grands groupes',
    }),
    defineField({
      name: 'infraTitle',
      title: 'Titre (h2)',
      ...blockContent,
      group: 'infra',
    }),
    defineField({
      name: 'infraCards',
      title: 'Cartes infrastructure (max. 6)',
      type: 'array',
      group: 'infra',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title',       title: 'Titre',       type: 'string' }),
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
          ],
          preview: { select: { title: 'title', subtitle: 'description' } },
        },
      ],
      validation: (Rule) => Rule.max(6),
    }),

    // ── IDÉAL POUR ────────────────────────────────────────────────────────────
    defineField({
      name: 'idealLabel',
      title: 'Label section',
      type: 'string',
      group: 'ideal',
      initialValue: 'Idéal pour',
    }),
    defineField({
      name: 'idealTitle',
      title: 'Titre (h2)',
      ...blockContent,
      group: 'ideal',
    }),
    defineField({
      name: 'idealTags',
      title: 'Tags (une entrée = un tag affiché)',
      type: 'array',
      group: 'ideal',
      of: [{ type: 'string' }],
      description: 'Ex : "Réunions de famille", "Séminaires", "Team building"...',
    }),

    // ── CTA FINAL ─────────────────────────────────────────────────────────────
    defineField({
      name: 'ctaLabel',
      title: 'Label section',
      type: 'string',
      group: 'cta',
      initialValue: 'Envie de venir en groupe ?',
    }),
    defineField({
      name: 'ctaTitle',
      title: 'Titre (h2)',
      ...blockContent,
      group: 'cta',
    }),
    defineField({
      name: 'ctaLead',
      title: 'Texte introductif',
      type: 'text',
      rows: 3,
      group: 'cta',
    }),
    defineField({
      name: 'ctaDevis',
      title: 'Bouton principal — texte',
      type: 'string',
      group: 'cta',
      initialValue: 'Demander un devis',
    }),
    defineField({
      name: 'ctaHebergements',
      title: 'Bouton secondaire — texte',
      type: 'string',
      group: 'cta',
      initialValue: 'Voir les hébergements',
    }),
  ],

  preview: {
    select: { language: 'language' },
    prepare({ language }) {
      return {
        title: 'Groupes & Séminaires',
        subtitle: language ? language.toUpperCase() : 'FR',
      }
    },
  },
})
