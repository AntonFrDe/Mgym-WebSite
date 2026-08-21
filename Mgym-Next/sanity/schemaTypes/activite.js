// activite.js — une activité proposée par l'association.
//
// Ces documents alimentent LES DEUX affichages du bloc « Nos pratiques » :
// le carrousel de cartes et le sentier vertical. Modifier une activité ici
// la met à jour dans les deux, sur toutes les variantes du site.
//
// L'ORDRE D'AFFICHAGE est un champ, pas l'ordre de saisie : les activités
// sont classées de la plus douce à la plus intense, et cet ordre a un sens
// pour la personne qui débute.

import { defineType, defineField } from 'sanity'

export const activite = defineType({
  name: 'activite',
  title: 'Activité',
  type: 'document',
  fields: [
    defineField({
      name: 'titre',
      title: 'Nom de l\'activité',
      type: 'string',
      description: 'Tel qu\'il apparaîtra sur le site. Exemple : « Yin Yoga ».',
      validation: (Rule) =>
        Rule.required()
          .max(60)
          .error('Le nom est obligatoire et ne doit pas dépasser 60 caractères.'),
    }),

    defineField({
      name: 'slug',
      title: 'Adresse web',
      type: 'slug',
      description:
        'Généré automatiquement à partir du nom. Ne le modifiez qu\'en cas ' +
        'de nécessité : une adresse déjà partagée cesserait de fonctionner.',
      options: { source: 'titre', maxLength: 60 },
      validation: (Rule) =>
        Rule.required().error('Cliquez sur « Generate » pour créer l\'adresse.'),
    }),

    defineField({
      name: 'descriptionCourte',
      title: 'Accroche',
      type: 'string',
      description:
        'Une seule ligne, visible avant que le visiteur ne déplie le ' +
        'détail. Exemple : « Une pratique tout en lenteur ».',
      validation: (Rule) =>
        Rule.required()
          .max(80)
          .error(
            'L\'accroche est obligatoire et limitée à 80 caractères : ' +
            'au-delà, elle passe sur deux lignes et déséquilibre la carte.'
          ),
    }),

    defineField({
      name: 'descriptionRiche',
      title: 'Description complète',
      type: 'texteSimple',
      description:
        'Le texte affiché quand le visiteur veut en savoir plus. Deux à ' +
        'quatre phrases suffisent.',
      validation: (Rule) =>
        Rule.required().error('La description complète est obligatoire.'),
    }),

    defineField({
      name: 'image',
      title: 'Photo',
      type: 'imageEditoriale',
      description:
        'Format paysage de préférence, 1200 px de large minimum. Elle est ' +
        'affichée en rond dans le sentier et en bandeau dans les cartes : ' +
        'placez le point de recadrage sur le sujet principal.',
      validation: (Rule) =>
        Rule.required().error('Chaque activité doit avoir une photo.'),
    }),

    defineField({
      name: 'motsCles',
      title: 'Mots-clés',
      type: 'array',
      of: [{ type: 'string' }],
      description:
        'Les petites étiquettes roses sous la description. Trois à six ' +
        'suffisent. Exemple : « Détente », « Lâcher-prise ».',
      validation: (Rule) =>
        Rule.max(8).warning(
          'Au-delà de 8 étiquettes, la carte devient difficile à lire.'
        ),
    }),

    defineField({
      name: 'ordreAffichage',
      title: 'Ordre d\'affichage',
      type: 'number',
      description:
        'Détermine la position sur le site : 1 en premier. Les activités ' +
        'sont classées de la plus douce à la plus intense. Laissé à 99, ' +
        'la nouvelle activité se place en dernier — vous ajusterez ensuite.',
      // Valeur par défaut : sans elle, créer une activité oblige à choisir
      // un numéro AVANT de pouvoir enregistrer, alors qu'on ne sait pas
      // encore où on veut la mettre. 99 la place en fin de liste.
      initialValue: 99,
      validation: (Rule) =>
        Rule.required()
          .integer()
          .min(1)
          .error('Indiquez un nombre entier à partir de 1.'),
    }),

    defineField({
      name: 'actif',
      title: 'Afficher sur le site',
      type: 'boolean',
      description:
        'Décochez pour retirer temporairement l\'activité du site sans la ' +
        'supprimer. Elle reste ici et pourra être remise en un clic.',
      initialValue: true,
    }),

    defineField({
      name: 'lienInterne',
      title: 'Lien « en savoir plus »',
      type: 'string',
      description:
        'Facultatif. Renvoie vers une autre section du site. Choisissez ' +
        'dans la liste, ou laissez vide.',
      options: {
        list: [
          { title: '(aucun)', value: '' },
          { title: 'Le planning', value: '#planning' },
          { title: 'Les prestations sur mesure', value: '#bespoke' },
          { title: 'Les tarifs', value: '#tarifs' },
          { title: 'Nous contacter', value: '#contact' },
        ],
      },
    }),

    defineField({
      name: 'libelleLien',
      title: 'Texte du lien',
      type: 'string',
      description:
        'Ce qui est écrit sur le lien ci-dessus. Laissé vide, le site ' +
        'affiche « Découvrir en détail → ».',
      hidden: ({ parent }) => !parent?.lienInterne,
    }),
  ],

  // Tri par défaut des listes du Studio : dans l'ordre du site, pour que
  // la cliente retrouve visuellement ce qu'elle voit en ligne.
  orderings: [
    {
      title: 'Ordre du site',
      name: 'ordreSite',
      by: [{ field: 'ordreAffichage', direction: 'asc' }],
    },
  ],

  preview: {
    select: {
      title: 'titre',
      subtitle: 'descriptionCourte',
      media: 'image',
      ordre: 'ordreAffichage',
      actif: 'actif',
    },
    prepare({ title, subtitle, media, ordre, actif }) {
      // Jamais « Untitled » : la liste doit être lisible d'un coup d'œil.
      const rang = ordre ? `${ordre}. ` : ''
      const masquee = actif === false ? '  ·  MASQUÉE' : ''
      return {
        title: `${rang}${title || 'Activité sans nom'}${masquee}`,
        subtitle: subtitle || '—',
        media,
      }
    },
  },
})
