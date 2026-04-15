// Sanity Studio — schéma gitesChambresPage
// À placer dans schemas/gitesChambresPage.js de votre projet Sanity Studio
// Ajouter 'gitesChambresPage' dans l'index des schémas (schemas/index.js ou sanity.config.ts)

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
  name: 'gitesChambresPage',
  title: 'Page Gîtes & Chambres',
  type: 'document',
  groups: [{ name: 'hero', title: 'Hero' }],
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
      name: 'heroLabel',
      title: 'Label hero',
      type: 'string',
      group: 'hero',
      initialValue: 'Gîtes & Chambres',
    }),
    defineField({
      name: 'heroLead',
      title: 'Accroche hero',
      ...blockContent,
      group: 'hero',
    }),
    defineField({
      name: 'heroMedia',
      title: 'Média hero (vidéo ou photo)',
      type: 'heroMedia',
      group: 'hero',
      description: 'Vidéos desktop/mobile + images de secours. Laissez vide pour utiliser les vidéos hardcodées.',
    }),
  ],

  preview: {
    select: { language: 'language' },
    prepare({ language }) {
      return {
        title: 'Page Gîtes & Chambres',
        subtitle: language ? language.toUpperCase() : 'FR',
      }
    },
  },
})
