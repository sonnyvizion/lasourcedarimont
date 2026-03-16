// Sanity Studio — schéma homePage
// À placer dans schemas/homePage.js de votre projet Sanity Studio
// Ajouter 'homePage' dans l'index des schémas (schemas/index.js ou sanity.config.ts)

import { defineField, defineType } from 'sanity'

// Réutilisable : contenu riche (titres, textes avec em/strong)
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
  name: 'homePage',
  title: 'Page d\'accueil',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'intro', title: 'Introduction' },
    { name: 'lodgings', title: 'Hébergements' },
    { name: 'features', title: 'Points forts' },
    { name: 'groups', title: 'Groupes & Séminaires' },
    { name: 'banner', title: 'Bannière région' },
    { name: 'reviews', title: 'Avis clients' },
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

    // ── HERO ─────────────────────────────────────────────────────────────
    defineField({
      name: 'heroLines',
      title: 'Titre hero (une ligne par entrée)',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'hero',
      description: 'Ex : ["Bienvenue au", "domaine de la", "Source d\'Arimont"]',
    }),
    defineField({
      name: 'heroNote',
      title: 'Note sous le CTA',
      type: 'string',
      group: 'hero',
      description: 'Ex : "Séjournez entre forêts et virages mythiques"',
    }),
    defineField({
      name: 'heroCta',
      title: 'Texte du bouton CTA',
      type: 'string',
      group: 'hero',
      initialValue: 'Réservez maintenant',
    }),
    defineField({
      name: 'scrollLabel',
      title: 'Label scroll',
      type: 'string',
      group: 'hero',
      initialValue: 'Scroll',
    }),
    defineField({
      name: 'heroImage',
      title: 'Image hero (desktop)',
      type: 'image',
      group: 'hero',
      options: { hotspot: true },
    }),
    defineField({
      name: 'heroImageMobile',
      title: 'Image hero (mobile)',
      type: 'image',
      group: 'hero',
      options: { hotspot: true },
    }),

    // ── INTRODUCTION ──────────────────────────────────────────────────────
    defineField({
      name: 'introLabel',
      title: 'Label section intro',
      type: 'string',
      group: 'intro',
      initialValue: 'Domaine de la Source d\'Arimont',
    }),
    defineField({
      name: 'introText',
      title: 'Texte intro',
      ...blockContent,
      group: 'intro',
    }),
    defineField({
      name: 'galleryImages',
      title: 'Photos du slider',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      group: 'intro',
    }),

    // ── HÉBERGEMENTS ──────────────────────────────────────────────────────
    defineField({
      name: 'lodgingsLabel',
      title: 'Label section hébergements',
      type: 'string',
      group: 'lodgings',
      initialValue: 'Gîtes & chambres',
    }),
    defineField({
      name: 'lodgingsIntro',
      title: 'Texte intro hébergements',
      ...blockContent,
      group: 'lodgings',
    }),
    defineField({
      name: 'lodgingsGitesLabel',
      title: 'Slide gîtes — label',
      type: 'string',
      group: 'lodgings',
      initialValue: 'Les gîtes',
    }),
    defineField({
      name: 'lodgingsGitesTitle',
      title: 'Slide gîtes — titre',
      ...blockContent,
      group: 'lodgings',
    }),
    defineField({
      name: 'lodgingsGitesCta',
      title: 'Slide gîtes — CTA',
      type: 'string',
      group: 'lodgings',
      initialValue: 'Voir les gîtes',
    }),
    defineField({
      name: 'lodgingsRoomsLabel',
      title: 'Slide chambres — label',
      type: 'string',
      group: 'lodgings',
      initialValue: 'Les chambres',
    }),
    defineField({
      name: 'lodgingsRoomsTitle',
      title: 'Slide chambres — titre',
      ...blockContent,
      group: 'lodgings',
    }),
    defineField({
      name: 'lodgingsRoomsCta',
      title: 'Slide chambres — CTA',
      type: 'string',
      group: 'lodgings',
      initialValue: 'Voir les chambres',
    }),

    // ── POINTS FORTS ──────────────────────────────────────────────────────
    defineField({
      name: 'featuresLabel',
      title: 'Label section points forts',
      type: 'string',
      group: 'features',
      initialValue: 'L\'essence du Domaine d\'Arimont',
    }),
    defineField({
      name: 'featuresIntro',
      title: 'Texte intro points forts',
      ...blockContent,
      group: 'features',
    }),
    defineField({
      name: 'featureCards',
      title: 'Cartes points forts (ordre : Nature, Spa, Domaine)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Titre', type: 'string' }),
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
          ],
          preview: { select: { title: 'title', subtitle: 'description' } },
        },
      ],
      group: 'features',
      validation: (Rule) => Rule.max(3),
    }),

    // ── GROUPES & SÉMINAIRES ──────────────────────────────────────────────
    defineField({
      name: 'groupsLabel',
      title: 'Label section groupes',
      type: 'string',
      group: 'groups',
      initialValue: 'Groupes & Séminaires',
    }),
    defineField({
      name: 'groupsTitle',
      title: 'Titre groupes',
      ...blockContent,
      group: 'groups',
    }),
    defineField({
      name: 'groupsLead',
      title: 'Texte groupes',
      ...blockContent,
      group: 'groups',
    }),
    defineField({
      name: 'groupsStats',
      title: 'Statistiques',
      type: 'object',
      group: 'groups',
      fields: [
        defineField({
          name: 'personnes',
          title: 'Personnes',
          type: 'object',
          fields: [
            defineField({ name: 'number', title: 'Chiffre', type: 'string', initialValue: '30+' }),
            defineField({ name: 'label', title: 'Label', type: 'string', initialValue: 'Personnes' }),
          ],
        }),
        defineField({
          name: 'hebergements',
          title: 'Hébergements',
          type: 'object',
          fields: [
            defineField({ name: 'number', title: 'Chiffre', type: 'string', initialValue: '5' }),
            defineField({ name: 'label', title: 'Label', type: 'string', initialValue: 'Hébergements' }),
          ],
        }),
        defineField({
          name: 'nature',
          title: 'Nature',
          type: 'object',
          fields: [
            defineField({ name: 'number', title: 'Chiffre', type: 'string', initialValue: '∞' }),
            defineField({ name: 'label', title: 'Label', type: 'string', initialValue: 'Ha de nature' }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'groupsCta',
      title: 'CTA groupes',
      type: 'string',
      group: 'groups',
      initialValue: 'Demander un devis',
    }),

    // ── BANNIÈRE RÉGION ───────────────────────────────────────────────────
    defineField({
      name: 'bannerLabel',
      title: 'Label bannière',
      type: 'string',
      group: 'banner',
      initialValue: 'L\'essence du Domaine d\'Arimont',
    }),
    defineField({
      name: 'bannerTitle',
      title: 'Titre bannière',
      ...blockContent,
      group: 'banner',
    }),
    defineField({
      name: 'bannerCta',
      title: 'CTA bannière',
      type: 'string',
      group: 'banner',
      initialValue: 'Découvrir la région',
    }),

    // ── AVIS CLIENTS ──────────────────────────────────────────────────────
    defineField({
      name: 'reviewsLabel',
      title: 'Label section avis',
      type: 'string',
      group: 'reviews',
      initialValue: 'Ils ont séjourné au Domaine',
    }),
    defineField({
      name: 'reviewsHeading',
      title: 'Titre section avis',
      ...blockContent,
      group: 'reviews',
    }),
    defineField({
      name: 'reviewsCta',
      title: 'CTA laisser un avis',
      type: 'string',
      group: 'reviews',
      initialValue: 'vous aussi laissez un avis',
    }),
  ],

  preview: {
    select: { language: 'language' },
    prepare({ language }) {
      return {
        title: 'Page d\'accueil',
        subtitle: language ? language.toUpperCase() : 'FR',
      }
    },
  },
})
