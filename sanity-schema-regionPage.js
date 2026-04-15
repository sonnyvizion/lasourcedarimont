import { defineField, defineType } from 'sanity'

const blockContent = defineField({
  name: 'content',
  type: 'array',
  of: [{ type: 'block', styles: [], lists: [], marks: { decorators: [{ title: 'Gras', value: 'strong' }, { title: 'Italique', value: 'em' }], annotations: [] } }],
})

export default defineType({
  name: 'regionPage',
  title: 'Page La Région',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'carte', title: 'Section carte' },
  ],
  fields: [
    defineField({ name: 'language', title: 'Langue', type: 'string', readOnly: true, hidden: true }),
    defineField({ name: 'heroLabel', title: 'Label hero', type: 'string', group: 'hero', initialValue: 'Découvrir la région' }),
    defineField({ name: 'heroLead', title: 'Accroche hero', ...blockContent, group: 'hero' }),
    defineField({ name: 'heroMedia', title: 'Média hero', type: 'heroMedia', group: 'hero' }),
    defineField({ name: 'carteLabel', title: 'Label carte', type: 'string', group: 'carte', initialValue: 'Explorer autour de Spa-Francorchamps' }),
    defineField({ name: 'carteTitre', title: 'Titre carte', ...blockContent, group: 'carte' }),
    defineField({ name: 'carteLead',  title: 'Texte intro carte', ...blockContent, group: 'carte' }),
    defineField({ name: 'carteNote',  title: 'Note légende pins', ...blockContent, group: 'carte' }),
  ],
  preview: {
    select: { language: 'language' },
    prepare({ language }) { return { title: 'Page La Région', subtitle: language?.toUpperCase() || 'FR' } },
  },
})
