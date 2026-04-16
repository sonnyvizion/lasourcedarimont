// sanity-schema-infraSlide.js
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'infraSlide',
  title: 'Slide infrastructure',
  type: 'document',
  fields: [
    defineField({ name: 'language', title: 'Langue', type: 'string', readOnly: true, hidden: true }),
    defineField({ name: 'title', title: 'Titre', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
    defineField({
      name: 'points',
      title: 'Points (liste)',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true }, validation: (Rule) => Rule.required() }),
    defineField({ name: 'imageAlt', title: 'Texte alternatif image', type: 'string' }),
    defineField({ name: 'order', title: 'Ordre', type: 'number', initialValue: 0 }),
  ],
  preview: {
    select: { title: 'title', media: 'image', subtitle: 'order' },
    prepare({ title, media, subtitle }) { return { title, media, subtitle: `Slide ${subtitle}` } },
  },
  orderings: [{ title: 'Ordre', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
})
