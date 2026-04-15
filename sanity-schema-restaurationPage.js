import { defineField, defineType } from 'sanity'

const blockContent = defineField({
  name: 'content',
  type: 'array',
  of: [{ type: 'block', styles: [], lists: [], marks: { decorators: [{ title: 'Gras', value: 'strong' }, { title: 'Italique', value: 'em' }], annotations: [] } }],
})

export default defineType({
  name: 'restaurationPage',
  title: 'Page Restauration',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'dejeuners', title: 'Section petits-déjeuners' },
    { name: 'repas', title: 'Section repas' },
  ],
  fields: [
    defineField({ name: 'language', title: 'Langue', type: 'string', readOnly: true, hidden: true }),
    defineField({ name: 'heroLabel', title: 'Label hero', type: 'string', group: 'hero', initialValue: 'Restauration sur place' }),
    defineField({ name: 'heroLead', title: 'Accroche hero', ...blockContent, group: 'hero' }),
    defineField({ name: 'heroMedia', title: 'Média hero', type: 'heroMedia', group: 'hero' }),
    defineField({ name: 'dejeunersLabel', title: 'Label section', type: 'string', group: 'dejeuners', initialValue: 'À emporter' }),
    defineField({ name: 'dejeunersTitre', title: 'Titre section', type: 'string', group: 'dejeuners', initialValue: 'Petits déjeuners' }),
    defineField({ name: 'dejeunersNote', title: 'Note commande', type: 'string', group: 'dejeuners', initialValue: 'Commandez la veille avant 19h pour garantir la disponibilité.' }),
    defineField({ name: 'repasLabel', title: 'Label section', type: 'string', group: 'repas', initialValue: 'En groupe' }),
    defineField({ name: 'repasTitre', title: 'Titre section', type: 'string', group: 'repas', initialValue: 'Repas conviviaux' }),
    defineField({ name: 'repasNote', title: 'Note commande', type: 'string', group: 'repas', initialValue: 'Sur réservation · À partir de 2 personnes selon les formules.' }),
  ],
  preview: {
    select: { language: 'language' },
    prepare({ language }) { return { title: 'Page Restauration', subtitle: language?.toUpperCase() || 'FR' } },
  },
})
