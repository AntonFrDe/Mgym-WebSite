// seoGlobal.js — ce que Google et les réseaux sociaux affichent du site.
//
// Document unique. Ces champs ne se voient pas sur le site : ils
// apparaissent dans l'onglet du navigateur, dans les résultats de recherche
// et dans l'aperçu quand quelqu'un partage un lien sur Facebook.
//
// Ils ne dupliquent pas siteContent : le grand titre de la page d'accueil
// s'adresse au visiteur déjà arrivé, celui-ci s'adresse à quelqu'un qui
// cherche encore.

import { defineType, defineField } from 'sanity'

export const seoGlobal = defineType({
  name: 'seoGlobal',
  title: 'Référencement',
  type: 'document',
  fields: [
    defineField({
      name: 'titre', title: 'Titre du site', type: 'string',
      description: 'Ce qui s\'affiche dans l\'onglet du navigateur et en bleu dans Google.',
      validation: (Rule) =>
        Rule.required().max(60).error('Le titre est obligatoire et limité à 60 caractères : au-delà, Google le coupe.'),
    }),
    defineField({
      name: 'description', title: 'Description', type: 'text', rows: 3,
      description: 'Les deux lignes grises sous le titre, dans les résultats de recherche. Décrivez l\'association et sa ville.',
      validation: (Rule) =>
        Rule.required().max(155).error('La description est obligatoire et limitée à 155 caractères : au-delà, Google la coupe.'),
    }),
    defineField({
      name: 'imagePartage', title: 'Image de partage', type: 'imageEditoriale',
      description: 'L\'aperçu affiché quand on partage le site sur Facebook ou WhatsApp. Format paysage, 1200 x 630 px idéalement.',
    }),
    defineField({
      name: 'urlCanonique', title: 'Adresse officielle du site', type: 'url',
      description: 'L\'adresse de référence, sans barre oblique finale. Exemple : https://mgym.fr',
      validation: (Rule) =>
        Rule.uri({ scheme: ['https'] }).error('L\'adresse doit commencer par https://'),
    }),
  ],

  preview: {
    select: { subtitle: 'titre' },
    prepare: ({ subtitle }) => ({ title: 'Référencement', subtitle: subtitle || 'titre non renseigné' }),
  },
})
