// tarifs.js — les petites briques répétées de la grille tarifaire.
//
// Elles vivent à part parce qu'elles apparaissent plusieurs fois dans le
// même formulaire : une formule à la carte et une saison partielle ont
// exactement la même forme.

import { defineType, defineField } from 'sanity'

export const tarifSimple = defineType({
  name: 'tarifSimple',
  title: 'Tarif',
  type: 'object',
  fields: [
    defineField({
      name: 'nom', title: 'Nom', type: 'string',
      description: 'Exemple : « Forfait 10 séances ».',
      validation: (Rule) => Rule.required().error('Le nom est obligatoire.'),
    }),
    defineField({
      name: 'detail', title: 'Précision', type: 'string',
      description: 'Une ligne sous le nom. Exemple : « Valable 3 mois ».',
    }),
    defineField({
      name: 'prix', title: 'Prix', type: 'string',
      description: 'Écrivez-le tel qu\'il doit s\'afficher, symbole compris : « 80€ ».',
      validation: (Rule) => Rule.required().error('Le prix est obligatoire.'),
    }),
  ],
  preview: {
    select: { title: 'nom', prix: 'prix', detail: 'detail' },
    prepare: ({ title, prix, detail }) => ({
      title: `${prix || '?'} — ${title || 'sans nom'}`,
      subtitle: detail || '',
    }),
  },
})

export const tarifSaison = defineType({
  name: 'tarifSaison',
  title: 'Tarif de saison',
  type: 'object',
  fields: [
    defineField({
      name: 'nom', title: 'Nom', type: 'string',
      description: 'Exemple : « Tarif fidélité ».',
      validation: (Rule) => Rule.required().error('Le nom est obligatoire.'),
    }),
    defineField({
      name: 'detail', title: 'Précision', type: 'string',
      description: 'Exemple : « Renouvellement d\'adhésion ».',
    }),
    defineField({
      name: 'prixUnePersonne', title: 'Prix pour une personne', type: 'string',
      validation: (Rule) => Rule.required().error('Le prix est obligatoire.'),
    }),
    defineField({
      name: 'prixFamille', title: 'Prix famille', type: 'string',
      description: 'Colonne « Famille » du tableau.',
      validation: (Rule) => Rule.required().error('Le prix famille est obligatoire.'),
    }),
  ],
  preview: {
    select: { title: 'nom', a: 'prixUnePersonne', b: 'prixFamille' },
    prepare: ({ title, a, b }) => ({
      title: title || 'sans nom',
      subtitle: `${a || '?'} seul · ${b || '?'} famille`,
    }),
  },
})

export const statistique = defineType({
  name: 'statistique',
  title: 'Chiffre-clé',
  type: 'object',
  fields: [
    defineField({
      name: 'nombre', title: 'Chiffre', type: 'string',
      description: 'Exemple : « +20 », « 5 », « 40+ ».',
      validation: (Rule) => Rule.required().error('Le chiffre est obligatoire.'),
    }),
    defineField({
      name: 'libelle', title: 'Libellé', type: 'string',
      description: 'Exemple : « Ans d\'expérience ».',
      validation: (Rule) =>
        Rule.required().max(24).error('Libellé obligatoire, 24 caractères maximum : au-delà il déborde.'),
    }),
  ],
  preview: {
    select: { title: 'nombre', subtitle: 'libelle' },
  },
})

export const reseauSocial = defineType({
  name: 'reseauSocial',
  title: 'Réseau social',
  type: 'object',
  fields: [
    defineField({
      name: 'nom', title: 'Réseau', type: 'string',
      options: {
        list: [
          { title: 'Facebook', value: 'facebook' },
          { title: 'Instagram', value: 'instagram' },
          { title: 'YouTube', value: 'youtube' },
          { title: 'WhatsApp', value: 'whatsapp' },
        ],
      },
      validation: (Rule) => Rule.required().error('Choisissez le réseau.'),
    }),
    defineField({
      name: 'url', title: 'Adresse de la page', type: 'url',
      description: 'L\'adresse complète de votre page, copiée depuis votre navigateur.',
      validation: (Rule) =>
        Rule.required().uri({ scheme: ['https'] }).error('L\'adresse doit commencer par https://'),
    }),
    defineField({
      name: 'libelle', title: 'Texte du lien', type: 'string',
      description: 'Ce qui est écrit sur le lien. Exemple : « Suivre M\'GYM ».',
    }),
  ],
  preview: {
    select: { title: 'nom', subtitle: 'url' },
  },
})
