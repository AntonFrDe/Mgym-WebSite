// evenement.js — un stage, un atelier, une retraite.
//
// ATTENTION À DEUX NOTIONS QUI SE RESSEMBLENT :
//
//   « Publié / Brouillon »  — bouton en bas du Studio. C'est ce qui décide
//                             si le contenu est visible sur le site.
//
//   « Statut de l'événement » — le champ ci-dessous. C'est une information
//                               MÉTIER affichée aux visiteurs : à venir,
//                               ou complet.
//
// Un événement peut très bien être publié (donc visible) ET complet.
// Ce sont deux axes indépendants ; les confondre ferait disparaître du
// site un stage simplement parce qu'il ne reste plus de place.

import { defineType, defineField } from 'sanity'

export const STATUTS_EVENEMENT = [
  { title: 'Inscriptions ouvertes', value: 'ouvert' },
  { title: 'Complet', value: 'complet' },
  { title: 'Annulé', value: 'annule' },
]

export const evenement = defineType({
  name: 'evenement',
  title: 'Événement',
  type: 'document',
  fields: [
    defineField({
      name: 'titre',
      title: 'Titre',
      type: 'string',
      description: 'Exemple : « Stage Yoga & respiration ».',
      validation: (Rule) =>
        Rule.required().max(80).error('Le titre est obligatoire, 80 caractères maximum.'),
    }),

    defineField({
      name: 'slug',
      title: 'Adresse web',
      type: 'slug',
      options: { source: 'titre', maxLength: 80 },
      validation: (Rule) => Rule.required().error('Cliquez sur « Generate ».'),
    }),

    defineField({
      name: 'activite',
      title: 'Activité rattachée',
      type: 'reference',
      to: [{ type: 'activite' }],
      description: 'Facultatif. Permet de relier le stage à une pratique du site.',
    }),

    defineField({
      name: 'dateDebut',
      title: 'Début',
      type: 'datetime',
      description: 'Date et heure de début, en heure française.',
      options: { dateFormat: 'DD/MM/YYYY', timeFormat: 'HH:mm' },
      validation: (Rule) => Rule.required().error('Indiquez la date et l\'heure de début.'),
    }),

    defineField({
      name: 'dateFin',
      title: 'Fin',
      type: 'datetime',
      description: 'Laissez vide pour un événement de quelques heures sur une seule journée.',
      options: { dateFormat: 'DD/MM/YYYY', timeFormat: 'HH:mm' },
      validation: (Rule) =>
        Rule.min(Rule.valueOfField('dateDebut')).error(
          'La fin ne peut pas précéder le début.'
        ),
    }),

    defineField({
      name: 'lieu',
      title: 'Lieu',
      type: 'string',
      description: 'Laissez vide si l\'événement a lieu à l\'adresse habituelle.',
    }),

    defineField({
      name: 'prix',
      title: 'Tarif',
      type: 'string',
      description:
        'Texte libre, pour pouvoir écrire « 45€ » comme « 45€ (35€ pour ' +
        'les adhérentes et adhérents) ».',
    }),

    defineField({
      name: 'placesMax',
      title: 'Nombre de places',
      type: 'number',
      description: 'Facultatif. Sert uniquement d\'information aux visiteurs.',
      validation: (Rule) => Rule.integer().min(1).warning('Le nombre de places doit être positif.'),
    }),

    defineField({
      name: 'image',
      title: 'Photo',
      type: 'imageEditoriale',
      description: 'Format paysage, 1200 px minimum. Sert aussi à l\'aperçu sur les réseaux sociaux.',
    }),

    defineField({
      name: 'description',
      title: 'Description',
      type: 'texteRiche',
      description: 'Ce que contient le stage, à qui il s\'adresse, ce qu\'il faut apporter.',
    }),

    defineField({
      name: 'statut',
      title: 'Statut',
      type: 'string',
      description:
        'Information affichée aux visiteurs. Sans rapport avec le bouton ' +
        '« Publier » : un événement complet reste visible sur le site.',
      options: { list: STATUTS_EVENEMENT, layout: 'radio' },
      initialValue: 'ouvert',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'lienInscription',
      title: 'Lien d\'inscription',
      type: 'url',
      description:
        'Adresse du formulaire d\'inscription à ce stage. Laissez vide ' +
        'pour renvoyer vers la page Contact.',
      validation: (Rule) =>
        Rule.uri({ scheme: ['http', 'https'] }).error(
          'L\'adresse doit commencer par https://'
        ),
    }),
  ],

  orderings: [
    { title: 'Date (prochains d\'abord)', name: 'dateAsc', by: [{ field: 'dateDebut', direction: 'asc' }] },
  ],

  preview: {
    select: { title: 'titre', debut: 'dateDebut', statut: 'statut', media: 'image' },
    prepare({ title, debut, statut, media }) {
      const d = debut
        ? new Date(debut).toLocaleDateString('fr-FR', {
            day: '2-digit', month: 'long', year: 'numeric',
          })
        : 'date manquante'
      const libelle = STATUTS_EVENEMENT.find((s) => s.value === statut)?.title
      const passe = debut && new Date(debut) < new Date() ? ' · passé' : ''
      return {
        title: title || 'Événement sans titre',
        subtitle: `${d} · ${libelle || '?'}${passe}`,
        media,
      }
    },
  },
})
