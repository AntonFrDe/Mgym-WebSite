// article.js — un article du blog.
//
// Le blog existe pour être trouvé sur les moteurs de recherche : c'est sa
// seule justification. D'où les deux champs « Référencement » en bas du
// formulaire, dont les limites de longueur ne sont pas décoratives — ce
// sont celles au-delà desquelles Google coupe le texte dans ses résultats.

import { defineType, defineField } from 'sanity'

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  groups: [
    { name: 'contenu', title: 'Contenu', default: true },
    { name: 'seo', title: 'Référencement' },
  ],
  fields: [
    defineField({
      name: 'titre',
      title: 'Titre',
      type: 'string',
      description: 'Le titre de l\'article, tel qu\'il s\'affichera en haut de la page.',
      group: 'contenu',
      validation: (Rule) =>
        Rule.required().max(90).error('Le titre est obligatoire, 90 caractères maximum.'),
    }),

    defineField({
      name: 'slug',
      title: 'Adresse web',
      type: 'slug',
      group: 'contenu',
      description:
        'L\'adresse de l\'article. Une fois l\'article publié et partagé, ' +
        'évitez de la changer : les liens existants cesseraient de marcher.',
      options: { source: 'titre', maxLength: 90 },
      validation: (Rule) => Rule.required().error('Cliquez sur « Generate ».'),
    }),

    defineField({
      name: 'extrait',
      title: 'Résumé',
      type: 'text',
      rows: 3,
      group: 'contenu',
      description: 'Deux ou trois phrases, affichées dans la liste des articles.',
      validation: (Rule) =>
        Rule.required().max(220).error('Le résumé est obligatoire, 220 caractères maximum.'),
    }),

    defineField({
      name: 'image',
      title: 'Image de couverture',
      type: 'imageEditoriale',
      group: 'contenu',
      description: 'Format paysage, 1200 px minimum. Sert aussi à l\'aperçu sur les réseaux.',
    }),

    defineField({
      name: 'auteur',
      title: 'Signature',
      type: 'string',
      description: 'Le nom affiché sous le titre.',
      group: 'contenu',
      initialValue: 'Emmanuelle Franc',
      validation: (Rule) => Rule.required().error('Indiquez qui signe l\'article.'),
    }),

    defineField({
      name: 'datePublication',
      title: 'Date de publication',
      type: 'date',
      group: 'contenu',
      description: 'La date affichée sur l\'article.',
      options: { dateFormat: 'DD/MM/YYYY' },
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (Rule) => Rule.required().error('Indiquez la date.'),
    }),

    defineField({
      name: 'corps',
      title: 'Texte de l\'article',
      type: 'texteRiche',
      description: 'Le contenu de l\'article. Utilisez les sous-titres pour l\'aérer : un texte de plus de trois paragraphes sans respiration décourage la lecture.',
      group: 'contenu',
      validation: (Rule) => Rule.required().error('Un article sans texte ne peut pas être publié.'),
    }),

    defineField({
      name: 'seoTitre',
      title: 'Titre dans Google',
      type: 'string',
      group: 'seo',
      description:
        'Ce qui apparaît en bleu dans les résultats de recherche. Laissez ' +
        'vide pour reprendre le titre de l\'article.',
      validation: (Rule) =>
        Rule.max(60).warning(
          'Au-delà de 60 caractères, Google coupe le titre par des points ' +
          'de suspension.'
        ),
    }),

    defineField({
      name: 'seoDescription',
      title: 'Description dans Google',
      type: 'text',
      rows: 2,
      group: 'seo',
      description:
        'Les deux lignes grises sous le titre, dans les résultats de ' +
        'recherche. Laissez vide pour reprendre le résumé.',
      validation: (Rule) =>
        Rule.max(155).warning(
          'Au-delà de 155 caractères, Google coupe la description.'
        ),
    }),
  ],

  orderings: [
    { title: 'Plus récents', name: 'recent', by: [{ field: 'datePublication', direction: 'desc' }] },
  ],

  preview: {
    select: { title: 'titre', date: 'datePublication', media: 'image', auteur: 'auteur' },
    prepare({ title, date, media, auteur }) {
      const d = date
        ? new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
        : 'sans date'
      return {
        title: title || 'Article sans titre',
        subtitle: `${d}${auteur ? ' · ' + auteur : ''}`,
        media,
      }
    },
  },
})
