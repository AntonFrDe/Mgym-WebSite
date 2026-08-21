// creneau.js — un cours qui revient chaque semaine.
//
// C'est LA RÈGLE, saisie une fois pour toute la saison : « le Pilates a
// lieu tous les lundis à 19h15 ». Les exceptions ponctuelles — une
// annulation, un déplacement — ne se saisissent PAS ici : elles ont leur
// propre formulaire (« Annulations & changements »). Modifier le créneau
// changerait tous les lundis de l'année.
//
// L'HEURE EST UNE HEURE LOCALE FRANÇAISE. « 19:15 » veut dire 19h15 à
// Mirepoix, en janvier comme en juillet. Le site ne convertit jamais cette
// valeur en heure universelle : c'est précisément ce qui ferait basculer
// un cours de 18h30 à 17h30 au changement d'heure.

import { defineType, defineField } from 'sanity'

// Les jours dans l'ordre de la semaine. Le site n'affiche aujourd'hui que
// du lundi au jeudi, mais la liste est complète pour ne pas bloquer un
// ajout futur.
export const JOURS = [
  { title: 'Lundi', value: 'lundi' },
  { title: 'Mardi', value: 'mardi' },
  { title: 'Mercredi', value: 'mercredi' },
  { title: 'Jeudi', value: 'jeudi' },
  { title: 'Vendredi', value: 'vendredi' },
  { title: 'Samedi', value: 'samedi' },
  { title: 'Dimanche', value: 'dimanche' },
]

export const creneau = defineType({
  name: 'creneau',
  title: 'Créneau régulier',
  type: 'document',
  fields: [
    defineField({
      name: 'activite',
      title: 'Activité',
      type: 'reference',
      to: [{ type: 'activite' }],
      description: 'Le cours donné sur ce créneau.',
      validation: (Rule) =>
        Rule.required().error('Choisissez l\'activité concernée.'),
    }),

    defineField({
      name: 'jour',
      title: 'Jour de la semaine',
      type: 'string',
      description: 'Le jour où ce cours a lieu, chaque semaine.',
      options: { list: JOURS, layout: 'dropdown' },
      validation: (Rule) => Rule.required().error('Choisissez un jour.'),
    }),

    defineField({
      name: 'heureDebut',
      title: 'Heure de début',
      type: 'string',
      description:
        'Au format 24 heures, avec deux points. Exemples : 09:30, 12:30, ' +
        '19:15. C\'est l\'heure française, elle ne change pas avec les ' +
        'saisons.',
      placeholder: '19:15',
      validation: (Rule) =>
        Rule.required()
          .regex(/^([01]\d|2[0-3]):[0-5]\d$/, { name: 'heure' })
          .error(
            'Écrivez l\'heure au format HH:MM, par exemple 19:15. ' +
            'N\'utilisez ni « h » ni virgule.'
          ),
    }),

    defineField({
      name: 'duree',
      title: 'Durée (minutes)',
      type: 'number',
      description: 'En minutes. Exemple : 60 pour une heure.',
      initialValue: 60,
      validation: (Rule) =>
        Rule.required()
          .integer()
          .min(15)
          .max(240)
          .error('Indiquez une durée entre 15 et 240 minutes.'),
    }),

    defineField({
      name: 'niveau',
      title: 'Niveau',
      type: 'string',
      description: 'Facultatif. Précisez si le cours s\'adresse à un public particulier.',
      options: {
        list: [
          { title: 'Tous niveaux', value: 'tous' },
          { title: 'Débutant', value: 'debutant' },
          { title: 'Intermédiaire', value: 'intermediaire' },
          { title: 'Avancé', value: 'avance' },
          { title: 'Séniors', value: 'seniors' },
        ],
      },
      initialValue: 'tous',
    }),

    defineField({
      name: 'lieu',
      title: 'Lieu',
      type: 'string',
      description:
        'Laissez vide si le cours a lieu à l\'adresse habituelle. ' +
        'Ne remplissez que pour une salle différente.',
    }),

    defineField({
      name: 'placesMax',
      title: 'Nombre de places',
      type: 'number',
      description: 'Facultatif. Sert uniquement d\'information.',
      validation: (Rule) =>
        Rule.integer().min(1).warning('Un nombre de places doit être positif.'),
    }),

    defineField({
      name: 'actif',
      title: 'Créneau en cours',
      type: 'boolean',
      description:
        'Décochez à la fin de la saison plutôt que de supprimer : ' +
        'vous pourrez le réactiver l\'année suivante.',
      initialValue: true,
    }),
  ],

  orderings: [
    {
      title: 'Jour puis heure',
      name: 'jourHeure',
      by: [
        { field: 'jour', direction: 'asc' },
        { field: 'heureDebut', direction: 'asc' },
      ],
    },
  ],

  preview: {
    select: {
      activite: 'activite.titre',
      jour: 'jour',
      heure: 'heureDebut',
      actif: 'actif',
      media: 'activite.image',
    },
    prepare({ activite, jour, heure, actif, media }) {
      // Objectif : « Pilates — Mardi 18h30 », jamais « Untitled ».
      const nomJour = JOURS.find((j) => j.value === jour)?.title || '?'
      const heureLisible = heure ? heure.replace(':', 'h') : '??h??'
      const arrete = actif === false ? '  ·  ARRÊTÉ' : ''
      return {
        title: `${activite || 'Activité non choisie'}${arrete}`,
        subtitle: `${nomJour} ${heureLisible}`,
        media,
      }
    },
  },
})
