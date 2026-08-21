// lien.js — l'annotation « lien » du texte riche.
//
// SÉCURITÉ : c'est le seul endroit du CMS où la cliente peut saisir une
// URL arbitraire, donc le seul vecteur d'injection possible dans du texte.
// La validation n'autorise que quatre schémas — http, https, mailto, tel —
// ce qui rejette javascript: et data:, les deux façons classiques de
// transformer un lien en script.
//
// Cette vérification est doublée au rendu (voir le composant de rendu du
// texte riche) : une validation de formulaire empêche la saisie, elle
// n'empêche pas une donnée arrivée autrement.

import { defineType, defineField } from 'sanity'

export const lien = defineType({
  name: 'lien',
  title: 'Lien',
  type: 'object',
  fields: [
    defineField({
      name: 'href',
      title: 'Adresse',
      type: 'url',
      description:
        'Adresse complète, en commençant par https:// — ou mailto: pour ' +
        'un courriel, tel: pour un numéro.',
      validation: (Rule) =>
        Rule.required()
          .uri({ scheme: ['http', 'https', 'mailto', 'tel'] })
          .error(
            "L'adresse doit commencer par https://, http://, mailto: ou tel:"
          ),
    }),
    defineField({
      name: 'nouvelOnglet',
      title: 'Ouvrir dans un nouvel onglet',
      type: 'boolean',
      description:
        'À cocher pour un site extérieur : le visiteur ne perd pas la page ' +
        "de M'GYM.",
      initialValue: true,
    }),
  ],
})
