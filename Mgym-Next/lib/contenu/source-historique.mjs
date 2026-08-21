// contenu-actuel.mjs — le contenu du site, tel qu'il est écrit en dur
// aujourd'hui, transcrit une fois pour la migration.
//
// POURQUOI UNE TRANSCRIPTION PLUTÔT QU'UNE EXTRACTION
// Les tableaux de données (activitesData.js, liens.js) sont importés
// directement : ce sont des modules JavaScript. Mais les paragraphes
// rédactionnels vivent DANS le JSX de About.js, Coach.js, Pricing.js…
// Les extraire automatiquement demanderait de parser du JSX pour un
// script qui ne sera lancé qu'une fois. Ils sont donc recopiés ici.
//
// Ce fichier est jetable : une fois la migration faite, la source de
// vérité est Sanity. Il reste au dépôt comme trace de l'état d'origine.

import { activites } from '../../components/activitesData.js'
import { TELEPHONE_AFFICHE, EMAIL, LIEN_INSCRIPTION, LIEN_STAGES } from '../../components/liens.js'

export { activites }

export const infosPratiques = {
  adresse: 'Route de Layrac-sur-Tarn\n31340 Mirepoix-sur-Tarn',
  telephone: TELEPHONE_AFFICHE,
  email: EMAIL,
  lienInscription: LIEN_INSCRIPTION || undefined,
  lienStages: LIEN_STAGES || undefined,
  reseauxSociaux: [
    { nom: 'facebook', url: 'https://www.facebook.com/', libelle: "Suivre M'GYM" },
  ],
}

export const seoGlobal = {
  titre: "M'GYM — Bien-être & Santé · Mirepoix-sur-Tarn",
  description:
    "Association sport et bien-être à Mirepoix-sur-Tarn. Pilates, Yoga, " +
    "Yogilates, Gym Bien-être, Forme & Force avec Emmanuelle Franc.",
}

// Les créneaux, à plat. Le tableau d'origine (Planning.js) les groupe par
// moment de la journée ; le modèle Sanity les veut un par un, avec leur
// heure exacte. L'activité est désignée par son nom : le script de
// migration la relie au document créé.
export const creneaux = [
  { activite: 'Gym Bien-être', jour: 'lundi',    heureDebut: '09:30', duree: 60 },
  { activite: 'Gym Bien-être', jour: 'mercredi', heureDebut: '09:30', duree: 60 },
  { activite: 'Yogilates & autres méthodes douces', jour: 'lundi',    heureDebut: '12:30', duree: 60 },
  { activite: 'Pilates',       jour: 'mercredi', heureDebut: '12:30', duree: 60 },
  { activite: 'Yoga',          jour: 'lundi',    heureDebut: '18:00', duree: 60 },
  { activite: 'Pilates',       jour: 'lundi',    heureDebut: '19:15', duree: 60 },
  { activite: 'Pilates',       jour: 'mardi',    heureDebut: '18:00', duree: 60 },
  { activite: 'Forme & Force', jour: 'mardi',    heureDebut: '19:00', duree: 60 },
  { activite: 'Pilates',       jour: 'jeudi',    heureDebut: '19:00', duree: 60 },
  { activite: 'Yin Yoga',      jour: 'jeudi',    heureDebut: '19:45', duree: 60 },
]

// Le nom exact du cours tel qu'il s'affiche aujourd'hui, quand il diffère
// du nom de l'activité (« Yoga postural » pour l'activité « Yoga »).
export const nomsAffiches = {
  'lundi|18:00': 'Yoga postural',
  'mardi|18:00': 'Pilates Ball',
  'mardi|19:00': 'Cardio Training',
  'jeudi|19:00': 'Cardio Pilates',
  'lundi|12:30': 'Yogilate',
}

export const siteContent = {
  // ── Accueil ─────────────────────────────────────────────────
  heroTitre: 'Bougeons',
  heroTitreItalique: 'ensemble',
  heroActivites: ['Pilates', 'Yoga', 'Prestation sur mesure', 'Gym Bien-Être', 'Renforcement Musculaire'],
  heroBoutonActivites: 'Découvrir les activités',
  heroBoutonContact: 'Nous rejoindre',
  citationBandeau: [
    { texte: "M'GYM est un espace de " },
    { texte: 'convivialité', gras: true },
    { texte: ' et de bien-être\noù prendre soin de soi est un ' },
    { texte: 'plaisir', gras: true },
    { texte: '.' },
  ],

  // ── À propos ────────────────────────────────────────────────
  aProposEtiquette: 'Notre histoire',
  aProposTitre: 'Une association',
  aProposTitreItalique: 'ancrée',
  aProposTitreFin: 'dans le village',
  aProposTexte: [{ texte:
    "Depuis les années 80, M'GYM fait bouger Mirepoix-sur-Tarn en plaçant la " +
    "santé, le bien-être et la convivialité au cœur de ses activités. À ses " +
    "débuts, l'association proposait des cours de gymnastique d'entretien aux " +
    "femmes du village. Aujourd'hui, elle accueille toutes celles et tous ceux " +
    "qui souhaitent pratiquer une activité physique dans une ambiance " +
    "chaleureuse et motivante." }],
  aProposAvantagesTitre: "Rejoindre M'GYM, c'est profiter :",
  aProposAvantages: [
    "d'une activité physique bénéfique pour le corps et le mental",
    "d'un accompagnement professionnel et personnalisé",
    'de cours accessibles à tous les niveaux',
    "d'une ambiance conviviale et bienveillante",
    "d'un véritable lieu de partage et de lien social",
  ],
  aProposConclusion: [
    { texte: "Coach sportive diplômée d'État, Emmanuelle Franc vous accompagne avec " },
    { texte: 'passion', gras: true },
    { texte: ' pour vous aider à bouger, progresser et ' },
    { texte: 'prendre soin de vous', gras: true },
    { texte: ", à votre rythme. Chez M'GYM, le bien-être se vit autant dans le mouvement que dans le plaisir de " },
    { texte: 'bouger ensemble', gras: true },
    { texte: '.' },
  ],
  aProposBadgeNombre: '+40',
  aProposBadgeLibelle: "Ans d'histoire",

  // ── Activités ───────────────────────────────────────────────
  activitesEtiquette: 'Nos pratiques',
  activitesTitre: 'Formes &',
  activitesTitreItalique: 'Bien-être',
  activitesChapo: 'Renforcez votre corps, libérez les tensions et retrouvez une énergie durable.',

  // ── Marche nordique ─────────────────────────────────────────
  outdoorEtiquette: 'Explorez aussi',
  outdoorTitre: 'Marche nordique &',
  outdoorTitreSuite: 'activités',
  outdoorTitreItalique: 'outdoor',
  outdoorTexte: [{ texte:
    "Respirez, bougez et ressourcez-vous en pleine nature. Nos séances " +
    "associent marche nordique, cardio, renforcement musculaire, yoga en " +
    "extérieur, étirements, marche afghane et découverte du patrimoine. Une " +
    "façon conviviale d'entretenir sa forme tout en profitant des bienfaits " +
    "du grand air." }],
  outdoorMotsCles: [
    'Marche nordique', 'Cardio', 'Renforcement musculaire',
    'Yoga en extérieur', 'Étirements', 'Marche afghane',
    'Découverte du patrimoine',
  ],

  // ── Sur mesure ──────────────────────────────────────────────
  bespokeEtiquette: 'Sur mesure',
  bespokeTitre: 'Interventions',
  bespokeTitreItalique: 'personnalisées',
  bespokeTexte: [{ texte:
    "Que vous soyez une association, un comité d'entreprise, un organisateur " +
    "d'évènements, un groupe d'amis ou un particulier, nous vous proposons des " +
    "interventions sur-mesure adaptées à vos envies : yoga, Pilates, marche " +
    "nordique, massages bien-être." }],
  bespokePublics: ['Particulier', 'Association', 'Entreprise', 'Massage'],
  bespokeBouton: 'Prendre rendez-vous',

  // ── Coach ───────────────────────────────────────────────────
  coachEtiquette: 'Votre coach',
  coachPrenom: 'Emmanuelle',
  coachNom: 'Franc',
  coachStatistiques: [
    { nombre: '+20', libelle: "Ans d'expérience" },
    { nombre: '5',   libelle: 'Disciplines' },
    { nombre: '40+', libelle: "Ans d'asso" },
  ],
  coachTexte: [{ texte:
    "Avec son énergie, Emmanuelle vous accompagne dans votre pratique avec des " +
    "conseils personnalisés. M'GYM est un espace de convivialité et de " +
    "bien-être où prendre soin de soi est un plaisir." }],
  coachCertifications: [
    'Diplômée des métiers de la forme',
    'Professeure certifiée Pilates',
    'Professeure certifiée Yoga',
    'Instructrice Marche Nordique',
    'Masseuse bien-être',
  ],

  // ── Tarifs ──────────────────────────────────────────────────
  tarifsEtiquette: 'Tarifs',
  tarifsTitre: 'Des formules',
  tarifsTitreItalique: 'accessibles',
  adhesion: { nom: 'Adhésion association', detail: 'Obligatoire pour participer aux cours', prix: '15€' },
  tarifsCarte: [
    { nom: 'Forfait 10 séances', detail: 'Valable 3 mois', prix: '80€' },
    { nom: 'Forfait 20 séances', detail: 'Valable 6 mois', prix: '145€' },
    { nom: 'À la séance', detail: 'Sans engagement', prix: '10€' },
  ],
  tarifsCarteNote: 'Prêt de bâton compris pour le forfait une seance',
  tarifsSaison: [
    { nom: 'Tarif fidélité', detail: "Renouvellement d'adhésion", prixUnePersonne: '210€', prixFamille: '410€' },
    { nom: 'Tarif plein',    detail: 'Première adhésion',         prixUnePersonne: '235€', prixFamille: '460€' },
  ],
  tarifsSaisonNote: 'Valable une saison, de septembre à juin',
  tarifsFamilleNote: '* Tarif famille : réservé aux parents et à leurs enfants, ainsi qu\'aux couples.',
  tarifsPartiels: [
    { nom: 'Mi-saison', detail: 'De janvier à juin', prix: '150€' },
    { nom: 'Trimestre', detail: "D'avril à juin",    prix: '75€' },
  ],
  tarifsSurMesure: [
    { texte: "Besoin d'une formule pour une association, un comité d'entreprise, une collectivité ou un événement ? " },
    { texte: 'Découvrez nos tarifs sur mesure', lien: '#bespoke' },
    { texte: '.' },
  ],
  inscriptionTitre: 'Envie de nous',
  inscriptionTitreItalique: 'rejoindre',
  inscriptionSousTitre: "L'inscription se fait par un formulaire en ligne. Comptez quelques minutes.",
  inscriptionAnnonce: 'Il vous sera demandé :',
  inscriptionEtapes: [
    'Vos coordonnées et votre date de naissance',
    'Le ou les cours choisis',
    'La formule tarifaire',
    'Votre mode de règlement',
    'Votre parcours sportif',
    'Les points de santé à signaler',
    "Votre accord pour le droit à l'image",
  ],
  inscriptionAlerte: [
    { texte: 'Le formulaire commence par vous demander si vous avez pris connaissance du ' },
    { texte: 'règlement intérieur', gras: true },
    { texte: ' et des ' },
    { texte: 'conditions générales', gras: true },
    { texte: '. Procurez-vous-les avant de commencer.' },
  ],
  inscriptionBouton: "Remplir le formulaire d'inscription",

  // ── Planning ────────────────────────────────────────────────
  planningEtiquette: 'Horaires des cours',
  planningTitre: 'Notre',
  planningTitreItalique: 'Planning',
  planningChapo: [{ texte:
    "Retrouvez ci-dessous l'ensemble des créneaux de la saison. Pour toute " +
    "question sur un cours en particulier, l'équipe M'GYM se tient à votre " +
    "disposition." }],
  planningSaison: 'Saison 2025 — 2026',
  planningBouton: 'Une question sur les horaires ?',

  // ── Contact ─────────────────────────────────────────────────
  contactEtiquette: 'Nous trouver',
  contactTitre: 'Contacts &',
  contactTitreItalique: 'Accès',
  contactCtaTitre: 'Prêtes et prêts à',
  contactCtaTitreItalique: 'commencer',
  contactCtaSousTitre: [{ texte: "Première séance d'essai ou inscription directe —\nEmmanuelle vous accueille avec plaisir." }],
  contactCtaAide: "Le formulaire s'ouvre dans un nouvel onglet. Il demande vos coordonnées, l'activité choisie et quelques informations sur votre santé.",
  reseauxEtiquette: 'Suivez-nous',
  reseauxTitre: 'Nos',
  reseauxTitreItalique: 'Réseaux',

  // ── Pied de page ────────────────────────────────────────────
  footerSlogan: 'Bougeons ensemble',
  footerMention: 'Mirepoix-sur-Tarn · depuis les années 80',
  footerBaseline: 'Bien-être & Santé',
}

// Les images de la page, hors activités (celles-ci portent la leur).
export const images = {
  heroImage:     { fichier: 'public/fond1.avif', alt: "Cours de yoga en salle chez M'GYM" },
  aProposPhoto:  { fichier: 'public/Images/coachHelpingChienTTenHauyt.avif', alt: "Cours collectif M'GYM" },
  outdoorImage:  { fichier: 'public/Images/MarcheNordique.avif', alt: "Sortie marche nordique M'GYM" },
  bespokeImage:  { fichier: 'public/Images/CoachMassage.avif', alt: "Massages bien-être M'GYM" },
  coachPhoto:    { fichier: 'public/Images/CoachPhoto.webp', alt: "Emmanuelle Franc — coach M'GYM" },
}
