// texteRiche.js — le format de saisie des textes longs.
//
// POURQUOI CE FORMAT EST VOLONTAIREMENT PAUVRE
// La cliente peut mettre en gras, en italique, faire des listes, poser un
// lien et créer des sous-titres. Elle ne peut PAS choisir une couleur, une
// taille de police, un alignement, ni coller du HTML.
//
// Ce n'est pas une limitation gratuite : c'est la garantie que le design du site
// reste intact quoi qu'elle écrive. Un champ « couleur du texte » finit
// toujours par produire du rose sur rose. La mise en forme appartient à
// globals.css, le contenu appartient à la cliente.

import { defineType, defineArrayMember } from 'sanity'

export const texteRiche = defineType({
  name: 'texteRiche',
  title: 'Texte',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      // Les seuls niveaux proposés. Pas de H1 : il n'y en a qu'un par page
      // et c'est le titre principal, géré par le code.
      styles: [
        { title: 'Paragraphe', value: 'normal' },
        { title: 'Titre de partie', value: 'h2' },
        { title: 'Sous-titre', value: 'h3' },
      ],
      lists: [
        { title: 'Liste à puces', value: 'bullet' },
        { title: 'Liste numérotée', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Gras', value: 'strong' },
          { title: 'Italique', value: 'em' },
        ],
        annotations: [{ type: 'lien' }],
      },
    }),
  ],
})

// Variante encore plus stricte, pour les paragraphes courts qui doivent
// tenir dans une mise en page fixe : ni titre, ni liste. Seulement du
// texte, du gras, de l'italique et des liens.
export const texteSimple = defineType({
  name: 'texteSimple',
  title: 'Texte',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [{ title: 'Paragraphe', value: 'normal' }],
      lists: [],
      marks: {
        decorators: [
          { title: 'Gras', value: 'strong' },
          { title: 'Italique', value: 'em' },
        ],
        annotations: [{ type: 'lien' }],
      },
    }),
  ],
})
