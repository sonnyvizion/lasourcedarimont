import { defineField, defineType } from 'sanity'

const blockContent = defineField({
  name: 'content',
  type: 'array',
  of: [{ type: 'block', styles: [], lists: [], marks: { decorators: [{ title: 'Gras', value: 'strong' }, { title: 'Italique', value: 'em' }], annotations: [] } }],
})

export default defineType({
  name: 'infrastructurePage',
  title: 'Page Infrastructures',
  type: 'document',
  groups: [
    { name: 'hero',       title: 'Hero' },
    { name: 'highlights', title: 'Highlights (carrousel)' },
    { name: 'ferme',      title: 'Section ferme' },
  ],
  fields: [
    defineField({ name: 'language', title: 'Langue', type: 'string', readOnly: true, hidden: true }),
    defineField({ name: 'heroLabel', title: 'Label hero', type: 'string', group: 'hero', initialValue: 'Infrastructures du Domaine' }),
    defineField({ name: 'heroLead', title: 'Accroche hero', ...blockContent, group: 'hero' }),
    defineField({ name: 'heroMedia', title: 'Média hero', type: 'heroMedia', group: 'hero' }),
    defineField({ name: 'highlightsLabel', title: 'Label section', type: 'string', group: 'highlights', initialValue: 'Ce qui vous attend sur place' }),
    defineField({ name: 'highlightsTitre', title: 'Titre section', ...blockContent, group: 'highlights' }),
    defineField({ name: 'fermeLabel', title: 'Label section ferme', type: 'string', group: 'ferme', initialValue: 'La ferme du domaine' }),
    defineField({ name: 'fermeTitre', title: 'Titre ferme', ...blockContent, group: 'ferme' }),
    defineField({ name: 'fermeLead',  title: 'Premier paragraphe ferme', ...blockContent, group: 'ferme' }),
    defineField({ name: 'fermeBody',  title: 'Deuxième paragraphe ferme', ...blockContent, group: 'ferme' }),
  ],
  preview: {
    select: { language: 'language' },
    prepare({ language }) { return { title: 'Page Infrastructures', subtitle: language?.toUpperCase() || 'FR' } },
  },
})
