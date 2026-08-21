// imageEditoriale.js — toute image que la cliente téléverse.
//
// `hotspot: true` ajoute dans le Studio un point à déplacer sur l'image :
// c'est ce que le site gardera visible quand il devra recadrer. Sans lui,
// une photo verticale recadrée en rond coupe les visages.
//
// Le texte alternatif est OBLIGATOIRE : il est lu par les personnes qui
// utilisent un lecteur d'écran, et affiché si l'image ne charge pas. Ce
// n'est pas une formalité — le site s'adresse à un public souvent senior.

import { defineType, defineField } from 'sanity'

export const imageEditoriale = defineType({
  name: 'imageEditoriale',
  title: 'Image',
  type: 'image',
  options: {
    hotspot: true,
    // Formats acceptés : uniquement des images matricielles. Le SVG est
    // exclu volontairement — c'est un format qui peut contenir du script,
    // donc un vecteur d'attaque déguisé en image.
    accept: 'image/jpeg,image/png,image/webp,image/avif',
  },
  fields: [
    defineField({
      name: 'alt',
      title: 'Description de l\'image',
      type: 'string',
      description:
        'Décrivez ce que montre la photo, en une phrase. Exemple : ' +
        '« Cours de Pilates au sol dans la salle de Mirepoix ».',
      validation: (Rule) =>
        Rule.required()
          .min(5)
          .error(
            'Une description est obligatoire : elle est lue à voix haute ' +
            "aux personnes malvoyantes et s'affiche si la photo ne charge pas."
          ),
    }),
  ],
  preview: {
    select: { media: 'asset', title: 'alt' },
    prepare({ media, title }) {
      return { media, title: title || 'Image sans description' }
    },
  },
})
