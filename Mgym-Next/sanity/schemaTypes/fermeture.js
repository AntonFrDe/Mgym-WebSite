// fermeture.js — une période pendant laquelle il n'y a aucun cours.
//
// Vacances scolaires, jours fériés, fermeture annuelle. Une seule saisie
// suffit à masquer tous les cours de la période : inutile de créer une
// annulation par jour.

import { defineType, defineField } from 'sanity'

export const fermeture = defineType({
  name: 'fermeture',
  title: 'Période de fermeture',
  type: 'document',
  fields: [
    defineField({
      name: 'libelle',
      title: 'Intitulé',
      type: 'string',
      description:
        'Affiché aux visiteurs. Exemple : « Vacances de Noël », ' +
        '« Fermeture estivale ».',
      validation: (Rule) =>
        Rule.required()
          .max(60)
          .error('L\'intitulé est obligatoire, 60 caractères maximum.'),
    }),

    defineField({
      name: 'dateDebut',
      title: 'Premier jour de fermeture',
      type: 'date',
      description: 'Le premier jour SANS cours.',
      options: { dateFormat: 'DD/MM/YYYY' },
      validation: (Rule) => Rule.required().error('Indiquez le premier jour.'),
    }),

    defineField({
      name: 'dateFin',
      title: 'Dernier jour de fermeture',
      type: 'date',
      description: 'Inclus : les cours reprennent le lendemain.',
      options: { dateFormat: 'DD/MM/YYYY' },
      validation: (Rule) =>
        Rule.required()
          .min(Rule.valueOfField('dateDebut'))
          .error(
            'Le dernier jour doit être identique ou postérieur au premier.'
          ),
    }),
  ],

  orderings: [
    { title: 'Date de début', name: 'debut', by: [{ field: 'dateDebut', direction: 'desc' }] },
  ],

  preview: {
    select: { title: 'libelle', debut: 'dateDebut', fin: 'dateFin' },
    prepare({ title, debut, fin }) {
      const f = (d) =>
        d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : '?'
      return {
        title: title || 'Fermeture sans intitulé',
        subtitle: `du ${f(debut)} au ${f(fin)}`,
      }
    },
  },
})
