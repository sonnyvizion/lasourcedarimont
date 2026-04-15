// sanity-schema-heroMedia.js
// Type objet partagé utilisé dans tous les heroes et banners du site.
// À enregistrer dans sanity.config.ts / schemas/index.js du Sanity Studio.

import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'heroMedia',
  title: 'Média hero / banner',
  type: 'object',
  fields: [
    defineField({
      name: 'mediaType',
      title: 'Type de média',
      type: 'string',
      options: {
        list: [
          { title: 'Vidéo (avec fallback photo)', value: 'video' },
          { title: 'Photo uniquement', value: 'photo' },
        ],
        layout: 'radio',
      },
      initialValue: 'video',
      validation: (Rule) => Rule.required(),
    }),

    // ── Vidéo ────────────────────────────────────────────────────────────────
    defineField({
      name: 'videoDesktop',
      title: 'Vidéo desktop',
      type: 'file',
      options: { accept: 'video/mp4,video/webm' },
      hidden: ({ parent }) => parent?.mediaType !== 'video',
    }),
    defineField({
      name: 'videoMobile',
      title: 'Vidéo mobile',
      type: 'file',
      options: { accept: 'video/mp4,video/webm' },
      hidden: ({ parent }) => parent?.mediaType !== 'video',
    }),
    defineField({
      name: 'fallbackDesktop',
      title: 'Photo fallback desktop (si vidéo indisponible)',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.mediaType !== 'video',
    }),
    defineField({
      name: 'fallbackMobile',
      title: 'Photo fallback mobile (si vidéo indisponible)',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.mediaType !== 'video',
    }),

    // ── Photo ────────────────────────────────────────────────────────────────
    defineField({
      name: 'photoDesktop',
      title: 'Photo desktop',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.mediaType !== 'photo',
    }),
    defineField({
      name: 'photoMobile',
      title: 'Photo mobile',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.mediaType !== 'photo',
    }),
  ],
  preview: {
    select: { mediaType: 'mediaType' },
    prepare({ mediaType }) {
      return {
        title: mediaType === 'video' ? '🎬 Vidéo + fallback photo' : '🖼 Photo',
      }
    },
  },
})
