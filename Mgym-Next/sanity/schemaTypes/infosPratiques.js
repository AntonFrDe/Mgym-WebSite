// infosPratiques.js — les coordonnées de l'association.
//
// Document unique. Ces informations apparaissent à plusieurs endroits du
// site — cartes de contact, pied de page, boutons « Appeler » — et les
// changer ici les change PARTOUT. C'est tout l'intérêt de ne les saisir
// qu'une fois.

import { defineType, defineField } from 'sanity'

export const infosPratiques = defineType({
  name: 'infosPratiques',
  title: 'Infos pratiques',
  type: 'document',
  fields: [
    defineField({
      name: 'adresse', title: 'Adresse', type: 'text', rows: 3,
      description: 'Sur deux lignes : la rue, puis le code postal et la ville.',
      validation: (Rule) => Rule.required().error('L\'adresse est obligatoire.'),
    }),
    defineField({
      name: 'telephone', title: 'Téléphone', type: 'string',
      description: 'Au format français avec espaces : 06 09 31 61 45. Le site fabrique tout seul le lien qui lance l\'appel.',
      validation: (Rule) =>
        Rule.required()
          .regex(/^0\d([ .]?\d{2}){4}$/, { name: 'téléphone' })
          .error('Écrivez le numéro à 10 chiffres, par exemple 06 09 31 61 45.'),
    }),
    defineField({
      name: 'email', title: 'Adresse e-mail', type: 'string',
      description: 'L\'adresse à laquelle on peut vous écrire. Elle apparaît sur le site et dans le pied de page.',
      validation: (Rule) =>
        Rule.required().email().error('Vérifiez l\'adresse e-mail : elle doit contenir une arobase et un point.'),
    }),
    defineField({
      name: 'horairesAccueil', title: 'Horaires d\'accueil', type: 'text', rows: 3,
      description: 'Facultatif. Quand peut-on vous joindre ? Laissez vide si cela ne s\'applique pas.',
    }),
    defineField({
      name: 'reseauxSociaux', title: 'Réseaux sociaux', type: 'array', of: [{ type: 'reseauSocial' }],
      description: 'Les pages que vous animez. Chacune apparaîtra dans le pied de page et dans la section « Suivez-nous ».',
    }),
    defineField({
      name: 'lienInscription', title: 'Formulaire d\'inscription', type: 'url',
      description: 'L\'adresse du formulaire Google d\'adhésion. Pour la récupérer : ouvrez le formulaire, cliquez « Envoyer », onglet en forme de maillon, « Copier ».',
      validation: (Rule) =>
        Rule.uri({ scheme: ['https'] }).error('L\'adresse doit commencer par https://'),
    }),
    defineField({
      name: 'lienStages', title: 'Formulaire d\'inscription aux stages', type: 'url',
      description: 'Facultatif, et différent de celui de l\'adhésion. Laissez vide si vous n\'en avez pas.',
      validation: (Rule) =>
        Rule.uri({ scheme: ['https'] }).error('L\'adresse doit commencer par https://'),
    }),
    defineField({
      name: 'positionCarte', title: 'Position sur la carte', type: 'geopoint',
      description: 'Le repère de la mini-carte et la destination du bouton « Itinéraire ». ' +
        'Pour la trouver : sur Google Maps, clic droit sur la salle, puis cliquez sur les deux nombres pour les copier. ' +
        'Le premier est la latitude, le second la longitude.',
    }),
    defineField({
      name: 'plaquetteGroupes', title: 'Plaquette « Groupes, événements & entreprises »', type: 'file',
      options: { accept: 'application/pdf' },
      description: 'Le PDF des interventions pour les groupes, associations et entreprises (onglet « Sur mesure »). ' +
        'Enregistrez-le en « qualité web » : un PDF de plusieurs dizaines de Mo ne s\'ouvre pas sur un téléphone.',
    }),
    defineField({
      name: 'plaquetteMassages', title: 'Plaquette « Massages bien-être »', type: 'file',
      options: { accept: 'application/pdf' },
      description: 'Le PDF des massages, avec leurs tarifs.',
    }),
    // Le formulaire d'inscription commence par demander si on a lu ces
    // deux documents : sans eux sur le site, la personne restait bloquée
    // dès la première question.
    defineField({
      name: 'reglementInterieur', title: 'Règlement intérieur (PDF)', type: 'file',
      options: { accept: 'application/pdf' },
      description: 'Proposé au téléchargement juste avant le bouton d\'inscription (section Tarifs).',
    }),
    defineField({
      name: 'conditionsGenerales', title: 'Conditions générales (PDF)', type: 'file',
      options: { accept: 'application/pdf' },
      description: 'Proposées au téléchargement juste avant le bouton d\'inscription (section Tarifs).',
    }),
  ],

  preview: {
    select: { subtitle: 'telephone' },
    prepare: ({ subtitle }) => ({ title: 'Infos pratiques', subtitle: subtitle || 'téléphone non renseigné' }),
  },
})
