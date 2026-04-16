// sanity-schema-partenairesPage.js
import { defineField, defineType } from 'sanity'

const blockContent = defineField({
  name: 'content',
  type: 'array',
  of: [{ type: 'block', styles: [], lists: [], marks: { decorators: [{ title: 'Gras', value: 'strong' }, { title: 'Italique', value: 'em' }], annotations: [] } }],
})

export default defineType({
  name: 'partenairesPage',
  title: 'Page Partenaires',
  type: 'document',
  groups: [{ name: 'intro', title: 'Introduction' }],
  fields: [
    defineField({ name: 'language', title: 'Langue', type: 'string', readOnly: true, hidden: true }),
    defineField({ name: 'introLabel', title: 'Label intro', type: 'string', group: 'intro', initialValue: 'Nos partenaires locaux' }),
    defineField({ name: 'introTitre', title: 'Titre intro', ...blockContent, group: 'intro' }),
    defineField({ name: 'introLead',  title: 'Texte intro', ...blockContent, group: 'intro' }),
  ],
  preview: {
    select: { language: 'language' },
    prepare({ language }) { return { title: 'Page Partenaires', subtitle: language?.toUpperCase() || 'FR' } },
  },
})
