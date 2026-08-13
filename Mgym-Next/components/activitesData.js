// activitesData.js — la SOURCE UNIQUE des 8 activités du site.
// Deux affichages différents consomment ces mêmes données :
//   · SentierActivites.js  → le chemin sinueux vertical (version d'origine)
//   · CarrouselActivites.js → les cartes qui défilent à l'horizontale (test)
// Modifier une activité ici la met à jour dans les deux affichages.
//
// L'ORDRE DU TABLEAU EST L'ORDRE AFFICHÉ, et il n'est pas arbitraire : les
// six activités régulières sont classées de la plus douce à la plus intense
// (Yin Yoga → Forme & Force), pour qu'une personne qui débute trouve
// naturellement son entrée en haut de liste. Les deux offres sur mesure
// ferment la marche : elles n'ont pas de niveau d'intensité propre.
// Déplacer une ligne ici change donc le classement sur tout le site.
//
// Champs :
//   name     : titre affiché
//   image    : chemin dans /public
//   accroche : une ligne de résumé (visible avant de lire le détail)
//   desc     : description complète
//   tags     : mots-clés courts
//   href     : (optionnel) ancre vers une section qui détaille l'activité
//   lienTexte: (optionnel) libellé de ce lien ; « Découvrir en détail → »
//              par défaut, à remplacer quand le lien mène ailleurs qu'à une
//              description (les dates du planning, par exemple)

export const activites = [
  {
    name: 'Yin Yoga',
    image: '/Images/SentierYinYoga.avif',
    accroche: 'Une pratique tout en lenteur',
    desc: 'Un véritable moment de déconnexion : des postures douces et profondes, tenues longuement dans une atmosphère calme pour relâcher les tensions, ralentir le rythme et retrouver un profond bien-être.',
    tags: ['Détente', 'Lâcher-prise', 'Déconnexion'],
  },
  {
    name: 'Yoga',
    image: '/Images/SentierYoga.avif',
    accroche: 'Respiration, souplesse et apaisement',
    desc: 'Une pratique ancestrale qui associe respiration, postures et détente pour retrouver équilibre et sérénité. Grâce à des enchaînements adaptés à chacune et chacun, améliorez votre souplesse, votre mobilité et votre posture, tout en apaisant le corps et l\'esprit. Chaque séance procure une sensation de bien-être, de légèreté et de détente profonde.',
    tags: ['Hatha yoga', 'Yin yoga', 'Ashtanga yoga'],
  },
  {
    name: 'Yogilates & autres méthodes douces',
    image: '/Images/SentierYogilates.avif',
    accroche: 'Yoga et pilates réunis',
    desc: 'Une pratique complète qui associe Pilates, Yoga et méthodes posturales (De Gasquet, Hypopressif, Mézières). Renforcez les muscles profonds, améliorez votre posture, votre souplesse, votre équilibre et votre mobilité. Chaque séance accorde une place essentielle à la respiration pour favoriser le bien-être, la conscience corporelle et un mouvement plus fluide.',
    tags: ['Animals Flow', 'Force et mobilité', 'Gainage profond'],
  },
  {
    name: 'Pilates',
    image: '/Images/SentierPilates.avif',
    accroche: 'Renforcement profond et posture',
    desc: 'Le Pilates renforce les muscles profonds, améliore la posture et protège le dos grâce à une respiration maîtrisée. Pratiqué au sol ou avec différents accessoires, il développe force, tonicité, mobilité et équilibre. Chaque séance procure une sensation de gainage, de légèreté et contribue à réduire les tensions du dos et le stress.',
    tags: ['Pilates débutant', 'Cardio Pilates', 'Flow Pilates'],
  },
  {
    name: 'Gym Bien-être',
    image: '/Images/SentierGymBienEtre.avif',
    accroche: 'Cardio, tonicité et équilibre',
    desc: 'Une séance complète et dynamique qui combine cardio ludique, renforcement musculaire, mobilité et étirements. Chaque cours améliore votre condition physique, votre équilibre et votre souplesse, dans une ambiance conviviale. L\'objectif : bouger avec plaisir, retrouver de l\'énergie et se sentir bien dans son corps.',
    tags: ['Gym Sénior Actif', 'Renforcement adapté', 'Cardio ludique'],
  },
  {
    name: 'Forme & Force',
    image: '/Images/SentierFormeForce.avif',
    accroche: 'Tonification et prévention',
    desc: 'Des séances dynamiques mêlant cardio, renforcement musculaire, circuit training, step et boxing. Développez votre force, votre endurance et votre tonicité tout en renforçant les muscles qui protègent les articulations et le dos. Un entraînement complet pour rester en forme durablement et prévenir les douleurs.',
    tags: ['Cardio Training', 'Renforcement musculaire', 'Circuit', 'Step fitness', 'Pump', 'Aérodanse'],
  },
  {
    name: 'Ateliers thématiques',
    image: '/Images/SentierAccompagnement.avif',
    accroche: 'Découvrir, approfondir, perfectionner',
    desc: 'Tout au long de la saison, nous vous proposons de découvrir, approfondir ou perfectionner d\'autres pratiques : le yoga, le pilates, la prévention des chutes, le yin yoga, les bains sonores, la nutrition et le bien-être, l\'auto-massage et bien d\'autres thématiques. Suivez notre actualité sur les réseaux et découvrez ici les prochaines dates.',
    tags: ['Bains sonores', 'Prévention des chutes', 'Auto-massage', 'Nutrition'],
    href: '#planning',
    lienTexte: 'Voir les prochaines dates →',
  },
  {
    name: 'Prestations sur mesure',
    image: '/Images/SentierPrestations.avif',
    accroche: 'Pour groupes, entreprises et événements',
    desc: 'Que vous soyez une association, un comité d\'entreprise, un organisateur d\'évènements, un groupe d\'amis ou un particulier, nous vous proposons des interventions sur mesure adaptées à vos envies : Yoga, Pilates, marche nordique, massages bien-être.',
    tags: ['One to One', 'Évènement', 'Animation Cohésion'],
    href: '#bespoke',
  },
]
