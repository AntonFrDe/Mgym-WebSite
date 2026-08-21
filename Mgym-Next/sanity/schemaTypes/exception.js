// exception.js — une modification ponctuelle sur un créneau.
//
// C'est ici qu'on annule le cours d'un mardi précis, qu'on le décale d'une
// demi-heure, ou qu'on le signale complet. Le créneau régulier n'est pas
// touché : la semaine suivante, tout reprend normalement.
//
// Une exception vise UNE date. Pour une semaine entière de vacances,
// utilisez plutôt « Périodes de fermeture » : une seule saisie au lieu de
// dix.

import { defineType, defineField } from 'sanity'

export const TYPES_EXCEPTION = [
  { title: 'Cours annulé', value: 'annule' },
  { title: 'Horaire modifié', value: 'deplace' },
  { title: 'Complet (inscriptions closes)', value: 'complet' },
]

export const exception = defineType({
  name: 'exception',
  title: 'Annulation ou changement',
  type: 'document',
  fields: [
    defineField({
      name: 'creneau',
      title: 'Créneau concerné',
      type: 'reference',
      to: [{ type: 'creneau' }],
      description: 'Le cours régulier touché par ce changement.',
      validation: (Rule) =>
        Rule.required().error('Choisissez le créneau concerné.'),
    }),

    defineField({
      name: 'date',
      title: 'Date concernée',
      type: 'date',
      description:
        'Le jour précis. Vérifiez qu\'il correspond bien au jour du ' +
        'créneau : une exception posée un mercredi sur un cours du mardi ' +
        'n\'aura aucun effet.',
      options: { dateFormat: 'DD/MM/YYYY' },
      validation: (Rule) => Rule.required().error('Indiquez la date.'),
    }),

    defineField({
      name: 'type',
      title: 'Que se passe-t-il ?',
      type: 'string',
      description: '« Annulé » retire le cours du planning. « Horaire modifié » le déplace. « Complet » le laisse visible en signalant qu\'il n\'y a plus de place.',
      options: { list: TYPES_EXCEPTION, layout: 'radio' },
      validation: (Rule) => Rule.required().error('Choisissez le type de changement.'),
    }),

    defineField({
      name: 'nouvelleHeure',
      title: 'Nouvelle heure',
      type: 'string',
      description: 'Format HH:MM, par exemple 18:00.',
      placeholder: '18:00',
      // N'apparaît que si « Horaire modifié » est choisi : un formulaire
      // qui montre un champ inutile fait hésiter.
      hidden: ({ parent }) => parent?.type !== 'deplace',
      validation: (Rule) =>
        Rule.custom((valeur, contexte) => {
          if (contexte.parent?.type !== 'deplace') return true
          if (!valeur) return 'Indiquez la nouvelle heure du cours.'
          if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(valeur)) {
            return 'Écrivez l\'heure au format HH:MM, par exemple 18:00.'
          }
          return true
        }),
    }),

    defineField({
      name: 'motif',
      title: 'Motif',
      type: 'string',
      description:
        'Facultatif, affiché aux visiteurs. Exemple : « Jour férié », ' +
        '« Coach en formation ». Restez bref.',
      validation: (Rule) =>
        Rule.max(80).warning('Un motif court est plus lisible sur le planning.'),
    }),
  ],

  orderings: [
    { title: 'Date (plus récente)', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] },
  ],

  preview: {
    select: {
      activite: 'creneau.activite.titre',
      date: 'date',
      type: 'type',
      motif: 'motif',
    },
    prepare({ activite, date, type, motif }) {
      const libelle = TYPES_EXCEPTION.find((t) => t.value === type)?.title || '?'
      const dateLisible = date
        ? new Date(date).toLocaleDateString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
          })
        : 'date manquante'
      return {
        title: `${dateLisible} — ${activite || 'créneau supprimé'}`,
        subtitle: motif ? `${libelle} · ${motif}` : libelle,
      }
    },
  },
})
