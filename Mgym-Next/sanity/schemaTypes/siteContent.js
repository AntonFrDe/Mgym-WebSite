// siteContent.js — TOUS les textes du site, en un seul document.
//
// Ce document est unique : il n'y en a qu'un, on ne peut ni le supprimer ni
// le dupliquer. Il correspond à ce que la cliente appelle « les textes du
// site », par opposition aux activités, aux cours et aux articles, qui sont
// des listes.
//
// Les champs sont regroupés par SECTION DE LA PAGE, dans l'ordre où on les
// rencontre en faisant défiler le site. Cinquante champs dans un seul
// formulaire seraient illisibles ; en onglets, chacun retrouve sa section.
//
// NOMMAGE : les noms suivent le vocabulaire de la cliente — heroTitre,
// aProposTexte, coachNom. Jamais content_block_3.

import { defineType, defineField } from 'sanity'

export const siteContent = defineType({
  name: 'siteContent',
  title: 'Textes du site',
  type: 'document',
  groups: [
    { name: 'accueil', title: 'Accueil', default: true },
    { name: 'apropos', title: 'À propos' },
    { name: 'activites', title: 'Activités' },
    { name: 'outdoor', title: 'Marche nordique' },
    { name: 'bespoke', title: 'Sur mesure' },
    { name: 'coach', title: 'Coach' },
    { name: 'tarifs', title: 'Tarifs' },
    { name: 'planning', title: 'Planning' },
    { name: 'contact', title: 'Contact' },
    { name: 'pied', title: 'Pied de page' },
  ],
  fields: [
    // ── ACCUEIL ────────────────────────────────────────────────
    defineField({
      name: 'heroTitre', title: 'Grand titre', type: 'string', group: 'accueil',
      description: 'Le premier mot, en haut de la page. Actuellement « Bougeons ».',
      validation: (Rule) => Rule.required().max(20).error('Titre obligatoire, 20 caractères maximum : au-delà il déborde sur mobile.'),
    }),
    defineField({
      name: 'heroTitreItalique', title: 'Second mot, en italique rose', type: 'string', group: 'accueil',
      description: 'Le mot juste en dessous. Actuellement « ensemble ».',
      validation: (Rule) => Rule.required().max(20).error('Obligatoire, 20 caractères maximum.'),
    }),
    defineField({
      name: 'heroImage', title: 'Photo de fond', type: 'imageEditoriale', group: 'accueil',
      description: 'Format paysage, 2000 px de large minimum. Elle occupe tout l\'écran d\'accueil ; un voile sombre est ajouté automatiquement pour que le titre reste lisible.',
    }),
    defineField({
      name: 'heroActivites', title: 'Bandeau d\'activités', type: 'array', of: [{ type: 'string' }], group: 'accueil',
      description: 'Les mots qui défilent en bas de l\'image d\'accueil. Cinq maximum, sinon la bande passe sur deux lignes.',
      validation: (Rule) => Rule.max(6).warning('Au-delà de 6, le bandeau passe sur deux lignes.'),
    }),
    defineField({
      name: 'heroBoutonActivites', title: 'Texte du bouton principal', type: 'string', group: 'accueil',
      description: 'Actuellement « Découvrir les activités ».',
    }),
    defineField({
      name: 'heroBoutonContact', title: 'Texte du second bouton', type: 'string', group: 'accueil',
      description: 'Actuellement « Nous rejoindre ».',
    }),
    defineField({
      name: 'citationBandeau', title: 'Citation du bandeau sombre', type: 'texteSimple', group: 'accueil',
      description: 'La phrase sur fond prune, juste sous l\'image d\'accueil. Mettez en gras les deux ou trois mots à faire ressortir.',
    }),

    // ── À PROPOS ───────────────────────────────────────────────
    defineField({ name: 'aProposEtiquette', title: 'Petite étiquette rose', type: 'string', group: 'apropos', description: 'Actuellement « Notre histoire ».' }),
    defineField({ name: 'aProposTitre', title: 'Titre', type: 'string', group: 'apropos', description: 'Actuellement « Une association ancrée dans le village ».' }),
    defineField({ name: 'aProposTitreItalique', title: 'Mot en italique du titre', type: 'string', group: 'apropos', description: 'Le mot mis en valeur. Actuellement « ancrée ».' }),
    defineField({ name: 'aProposTitreFin', title: 'Fin du titre', type: 'string', group: 'apropos',
      description: 'Le texte qui suit le mot en italique. Actuellement « dans le village ».' }),
    defineField({ name: 'aProposTexte', title: 'Texte d\'introduction', type: 'texteSimple',
      description: 'Le premier paragraphe de la section. Racontez l\'histoire de l\'association.', group: 'apropos' }),
    defineField({ name: 'aProposAvantagesTitre', title: 'Titre de la liste', type: 'string', group: 'apropos', description: 'Actuellement « Rejoindre M\'GYM, c\'est profiter : ».' }),
    defineField({
      name: 'aProposAvantages', title: 'Les avantages', type: 'array', of: [{ type: 'string' }], group: 'apropos',
      description: 'Un par ligne. Ils s\'affichent avec une petite étoile rose.',
    }),
    defineField({ name: 'aProposConclusion', title: 'Paragraphe de conclusion', type: 'texteSimple', group: 'apropos', description: 'Mettez en gras les mots à faire ressortir en rose.' }),
    defineField({ name: 'aProposPhoto', title: 'Photo', type: 'imageEditoriale', group: 'apropos', description: 'Format paysage, 1200 px minimum.' }),
    defineField({ name: 'aProposBadgeNombre', title: 'Chiffre du badge', type: 'string', group: 'apropos', description: 'Le grand chiffre sur la photo. Actuellement « +40 ».' }),
    defineField({ name: 'aProposBadgeLibelle', title: 'Texte du badge', type: 'string', group: 'apropos', description: 'Actuellement « Ans d\'histoire ».' }),

    // ── ACTIVITÉS ──────────────────────────────────────────────
    defineField({ name: 'activitesEtiquette', title: 'Petite étiquette rose', type: 'string', group: 'activites', description: 'Actuellement « Nos pratiques ».' }),
    defineField({ name: 'activitesTitre', title: 'Titre', type: 'string', group: 'activites', description: 'Actuellement « Formes & ».' }),
    defineField({ name: 'activitesTitreItalique', title: 'Mot en italique', type: 'string', group: 'activites', description: 'Actuellement « Bien-être ».' }),
    defineField({ name: 'activitesChapo', title: 'Phrase d\'introduction', type: 'string', group: 'activites', description: 'La phrase sous le titre. L\'instruction de manipulation (« cliquez sur une étape… ») est ajoutée automatiquement par le site.' }),

    // ── MARCHE NORDIQUE ────────────────────────────────────────
    defineField({ name: 'outdoorEtiquette', title: 'Petite étiquette rose', type: 'string', group: 'outdoor', description: 'Actuellement « Explorez aussi ».' }),
    defineField({ name: 'outdoorTitre', title: 'Titre', type: 'string',
      description: 'Actuellement « Marche nordique & activités ».', group: 'outdoor' }),
    defineField({ name: 'outdoorTitreSuite', title: 'Début de la 2e ligne du titre', type: 'string', group: 'outdoor',
      description: 'Le titre est sur deux lignes. Ceci est le début de la seconde. Actuellement « activités ».' }),
    defineField({ name: 'outdoorTitreItalique', title: 'Mot en italique', type: 'string',
      description: 'Le mot mis en valeur en rose. Actuellement « outdoor ».', group: 'outdoor' }),
    defineField({ name: 'outdoorTexte', title: 'Texte', type: 'texteSimple',
      description: 'Le paragraphe de présentation des sorties en extérieur.', group: 'outdoor' }),
    defineField({ name: 'outdoorImage', title: 'Photo', type: 'imageEditoriale',
      description: 'Format paysage, 1200 px minimum.', group: 'outdoor' }),
    defineField({ name: 'outdoorMotsCles', title: 'Étiquettes', type: 'array', of: [{ type: 'string' }], group: 'outdoor', description: 'Les petites pastilles sous le texte.' }),

    // ── SUR MESURE ─────────────────────────────────────────────
    defineField({ name: 'bespokeEtiquette', title: 'Petite étiquette rose', type: 'string', group: 'bespoke', description: 'Actuellement « Sur mesure ».' }),
    defineField({ name: 'bespokeTitre', title: 'Titre', type: 'string',
      description: 'Actuellement « Interventions ».', group: 'bespoke' }),
    defineField({ name: 'bespokeTitreItalique', title: 'Mot en italique', type: 'string',
      description: 'Le mot mis en valeur en rose. Actuellement « personnalisées ».', group: 'bespoke' }),
    defineField({ name: 'bespokeTexte', title: 'Texte', type: 'texteSimple',
      description: 'À qui s\'adressent ces prestations et ce qu\'elles contiennent.', group: 'bespoke' }),
    defineField({
      name: 'bespokePublics', title: 'Publics visés', type: 'array', of: [{ type: 'string' }], group: 'bespoke',
      description: 'Les quatre pastilles. Actuellement : Particulier, Association, Entreprise, Massage.',
      validation: (Rule) => Rule.max(6).warning('Au-delà de 6, la grille se déséquilibre.'),
    }),
    defineField({ name: 'bespokeImage', title: 'Photo', type: 'imageEditoriale',
      description: 'Format paysage, 1200 px minimum.', group: 'bespoke' }),
    defineField({ name: 'bespokeBouton', title: 'Texte du bouton', type: 'string', group: 'bespoke', description: 'Actuellement « Prendre rendez-vous ».' }),

    // ── COACH ──────────────────────────────────────────────────
    defineField({ name: 'coachEtiquette', title: 'Petite étiquette rose', type: 'string', group: 'coach', description: 'Actuellement « Votre coach ».' }),
    defineField({ name: 'coachPrenom', title: 'Prénom', type: 'string',
      description: 'Affiché en grand, sur la première ligne.', group: 'coach' }),
    defineField({ name: 'coachNom', title: 'Nom (en italique rose)', type: 'string',
      description: 'Affiché sous le prénom, en italique rose.', group: 'coach' }),
    defineField({ name: 'coachPhoto', title: 'Photo', type: 'imageEditoriale', group: 'coach', description: 'Format portrait de préférence. Placez le point de recadrage sur le visage.' }),
    defineField({
      name: 'coachStatistiques', title: 'Chiffres-clés', type: 'array', of: [{ type: 'statistique' }], group: 'coach',
      description: 'Les trois chiffres encadrés. Trois exactement : deux ou quatre déséquilibrent la ligne.',
      validation: (Rule) => Rule.max(3).warning('Le bandeau est prévu pour trois chiffres.'),
    }),
    defineField({ name: 'coachTexte', title: 'Présentation', type: 'texteSimple',
      description: 'Quelques phrases de présentation, à la troisième personne.', group: 'coach' }),
    defineField({ name: 'coachCertifications', title: 'Diplômes et certifications', type: 'array', of: [{ type: 'string' }], group: 'coach', description: 'Un par ligne.' }),

    // ── TARIFS ─────────────────────────────────────────────────
    defineField({ name: 'tarifsEtiquette', title: 'Petite étiquette rose', type: 'string', group: 'tarifs', description: 'Actuellement « Tarifs ».' }),
    defineField({ name: 'tarifsTitre', title: 'Titre', type: 'string',
      description: 'Actuellement « Des formules ».', group: 'tarifs' }),
    defineField({ name: 'tarifsTitreItalique', title: 'Mot en italique', type: 'string',
      description: 'Le mot mis en valeur en rose. Actuellement « accessibles ».', group: 'tarifs' }),
    defineField({ name: 'adhesion', title: 'Adhésion obligatoire', type: 'tarifSimple', group: 'tarifs', description: 'Le bandeau rose en haut de la grille.' }),
    defineField({ name: 'tarifsCarte', title: 'Formules à la carte', type: 'array', of: [{ type: 'tarifSimple' }], group: 'tarifs', description: 'Les vignettes blanches. Trois de préférence.' }),
    defineField({ name: 'tarifsCarteNote', title: 'Note sous les formules', type: 'string',
      description: 'La ligne en italique sous les vignettes. Exemple : « Prêt de bâton compris ».', group: 'tarifs' }),
    defineField({ name: 'tarifsSaison', title: 'Tarifs à la saison', type: 'array', of: [{ type: 'tarifSaison' }], group: 'tarifs', description: 'Les lignes du tableau à deux colonnes.' }),
    defineField({ name: 'tarifsSaisonNote', title: 'Note sous le tableau', type: 'string', group: 'tarifs', description: 'Actuellement « Valable une saison, de septembre à juin ».' }),
    defineField({ name: 'tarifsFamilleNote', title: 'Précision sur le tarif famille', type: 'string', group: 'tarifs', description: 'La ligne commençant par une astérisque, sous le tableau.' }),
    defineField({ name: 'tarifsPartiels', title: 'Saisons partielles', type: 'array', of: [{ type: 'tarifSimple' }], group: 'tarifs', description: 'Mi-saison, trimestre. Deux vignettes.' }),
    defineField({ name: 'tarifsSurMesure', title: 'Phrase « sur mesure »', type: 'texteSimple', group: 'tarifs', description: 'Le paragraphe qui renvoie vers les prestations sur mesure.' }),
    defineField({ name: 'inscriptionTitre', title: 'Titre du bloc inscription', type: 'string',
      description: 'Actuellement « Envie de nous ».', group: 'tarifs' }),
    defineField({ name: 'inscriptionTitreItalique', title: 'Mot en italique', type: 'string',
      description: 'Le mot mis en valeur en rose. Actuellement « rejoindre ».', group: 'tarifs' }),
    defineField({ name: 'inscriptionSousTitre', title: 'Sous-titre', type: 'string',
      description: 'Une phrase qui rassure : combien de temps prend le formulaire.', group: 'tarifs' }),
    defineField({ name: 'inscriptionAnnonce', title: 'Titre de la liste', type: 'string', group: 'tarifs', description: 'Actuellement « Il vous sera demandé : ».' }),
    defineField({
      name: 'inscriptionEtapes', title: 'Ce que demande le formulaire', type: 'array', of: [{ type: 'string' }], group: 'tarifs',
      description: 'IMPORTANT : cette liste doit refléter les vraies questions du formulaire d\'inscription. Si vous ajoutez une question dans le formulaire Google, ajoutez-la ici aussi — une annonce fausse est pire que pas d\'annonce.',
    }),
    defineField({ name: 'inscriptionAlerte', title: 'Encadré d\'avertissement', type: 'texteSimple', group: 'tarifs', description: 'L\'encadré blanc à liseré rose, avant le bouton. Sert à prévenir de ce qu\'il faut préparer.' }),
    defineField({ name: 'inscriptionBouton', title: 'Texte du bouton', type: 'string',
      description: 'Actuellement « Remplir le formulaire d\'inscription ».', group: 'tarifs' }),

    // ── PLANNING ───────────────────────────────────────────────
    defineField({ name: 'planningEtiquette', title: 'Petite étiquette rose', type: 'string',
      description: 'Actuellement « Horaires des cours ».', group: 'planning' }),
    defineField({ name: 'planningTitre', title: 'Titre', type: 'string',
      description: 'Actuellement « Notre ».', group: 'planning' }),
    defineField({ name: 'planningTitreItalique', title: 'Mot en italique', type: 'string',
      description: 'Le mot mis en valeur en rose. Actuellement « Planning ».', group: 'planning' }),
    defineField({ name: 'planningChapo', title: 'Phrase d\'introduction', type: 'texteSimple',
      description: 'La phrase d\'introduction, sous le titre.', group: 'planning' }),
    defineField({ name: 'planningSaison', title: 'Libellé de la saison', type: 'string', group: 'planning', description: 'Affiché au-dessus du tableau. Exemple : « Saison 2026 — 2027 ».' }),
    defineField({ name: 'planningBouton', title: 'Texte du bouton en bas', type: 'string',
      description: 'Le bouton sous le tableau. Actuellement « Une question sur les horaires ? ».', group: 'planning' }),

    // ── CONTACT ────────────────────────────────────────────────
    defineField({ name: 'contactEtiquette', title: 'Petite étiquette rose', type: 'string',
      description: 'Actuellement « Nous trouver ».', group: 'contact' }),
    defineField({ name: 'contactTitre', title: 'Titre', type: 'string',
      description: 'Actuellement « Contacts & ».', group: 'contact' }),
    defineField({ name: 'contactTitreItalique', title: 'Mot en italique', type: 'string',
      description: 'Le mot mis en valeur en rose. Actuellement « Accès ».', group: 'contact' }),
    defineField({ name: 'contactCtaTitre', title: 'Titre de l\'encadré sombre', type: 'string',
      description: 'Actuellement « Prêtes et prêts à ».', group: 'contact' }),
    defineField({ name: 'contactCtaTitreItalique', title: 'Mot en italique', type: 'string',
      description: 'Le mot mis en valeur en rose. Actuellement « commencer ».', group: 'contact' }),
    defineField({ name: 'contactCtaSousTitre', title: 'Sous-titre de l\'encadré', type: 'texteSimple',
      description: 'Deux lignes sous le titre de l\'encadré sombre.', group: 'contact' }),
    defineField({ name: 'contactCtaAide', title: 'Phrase sous les boutons', type: 'string', group: 'contact', description: 'Explique où mène le bouton d\'inscription.' }),
    defineField({ name: 'reseauxEtiquette', title: 'Étiquette de la section Réseaux', type: 'string',
      description: 'Actuellement « Suivez-nous ».', group: 'contact' }),
    defineField({ name: 'reseauxTitre', title: 'Titre de la section Réseaux', type: 'string',
      description: 'Actuellement « Nos ».', group: 'contact' }),
    defineField({ name: 'reseauxTitreItalique', title: 'Mot en italique', type: 'string',
      description: 'Le mot mis en valeur en rose. Actuellement « Réseaux ».', group: 'contact' }),

    // ── PIED DE PAGE ───────────────────────────────────────────
    defineField({ name: 'footerSlogan', title: 'Slogan', type: 'string', group: 'pied', description: 'Actuellement « Bougeons ensemble ».' }),
    defineField({ name: 'footerMention', title: 'Mention sous le slogan', type: 'string', group: 'pied', description: 'Actuellement « Mirepoix-sur-Tarn · depuis les années 80 ».' }),
    defineField({ name: 'footerBaseline', title: 'Sous-titre du logo', type: 'string', group: 'pied', description: 'Actuellement « Bien-être & Santé ».' }),
  ],

  preview: {
    prepare: () => ({ title: 'Textes du site', subtitle: 'Document unique — tous les textes de la page' }),
  },
})
