// temoignage.js — un avis d'adhérente ou d'adhérent, affiché sous la coach.
//
// La case « accord » est OBLIGATOIRE pour publier : on ne cite pas
// quelqu'un sans lui avoir demandé. Et on ne publie que de VRAIS avis —
// un avis inventé est une pratique commerciale trompeuse.

import { defineType, defineField } from 'sanity'

export const SOURCES_AVIS = [
  { title: 'Avis Google', value: 'google' },
  { title: 'Facebook', value: 'facebook' },
  { title: 'Recueilli directement', value: 'direct' },
]

export const temoignage = defineType({
  name: 'temoignage',
  title: 'Témoignage',
  type: 'object',
  fields: [
    defineField({
      name: 'texte',
      title: 'Ce que la personne a écrit',
      type: 'text',
      rows: 4,
      description: 'Recopiez ses mots, sans les réécrire. Deux à quatre phrases se lisent mieux qu\'un long paragraphe.',
      validation: (Rule) =>
        Rule.required().max(400).error('Le texte est obligatoire, 400 caractères maximum.'),
    }),
    defineField({
      name: 'auteur',
      title: 'Signature',
      type: 'string',
      description: 'Prénom et initiale, par exemple « Martine D. ». Jamais le nom complet sans accord.',
    }),
    defineField({
      name: 'source',
      title: 'Provenance',
      type: 'string',
      options: { list: SOURCES_AVIS, layout: 'radio' },
      initialValue: 'direct',
    }),
    defineField({
      name: 'note',
      title: 'Note sur 5',
      type: 'number',
      description: 'Facultatif. Pour un avis Google, recopiez le nombre d\'étoiles.',
      validation: (Rule) => Rule.integer().min(1).max(5).error('Une note entre 1 et 5.'),
    }),
    defineField({
      name: 'accord',
      title: 'La personne est d\'accord pour être citée sur le site',
      type: 'boolean',
      validation: (Rule) =>
        Rule.custom((v) => v === true || 'Demandez son accord avant de publier ce témoignage.'),
    }),
  ],
  preview: {
    select: { auteur: 'auteur', texte: 'texte', source: 'source' },
    prepare: ({ auteur, texte, source }) => ({
      title: auteur || 'Témoignage anonyme',
      subtitle: `${SOURCES_AVIS.find((s) => s.value === source)?.title ?? ''} · ${texte ?? ''}`,
    }),
  },
})
