// sanity-schema-farmPhoto.js
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'farmPhoto',
  title: 'Photo ferme',
  type: 'document',
  fields: [
    defineField({ name: 'language', title: 'Langue', type: 'string', readOnly: true, hidden: true }),
    defineField({ name: 'image', title: 'Photo', type: 'image', options: { hotspot: true }, validation: (Rule) => Rule.required() }),
    defineField({ name: 'alt', title: 'Texte alternatif', type: 'string' }),
    defineField({ name: 'caption', title: 'Légende', type: 'string' }),
    defineField({ name: 'order', title: 'Ordre', type: 'number', initialValue: 0 }),
  ],
  preview: {
    select: { title: 'caption', media: 'image', subtitle: 'order' },
    prepare({ title, media, subtitle }) { return { title: title || 'Photo ferme', media, subtitle: `Photo ${subtitle}` } },
  },
  orderings: [{ title: 'Ordre', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
})
