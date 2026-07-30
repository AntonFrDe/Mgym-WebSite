// activitesData.js — la SOURCE UNIQUE des 8 activités du site.
// Deux affichages différents consomment ces mêmes données :
//   · SentierActivites.js  → le chemin sinueux vertical (version d'origine)
//   · CarrouselActivites.js → les cartes qui défilent à l'horizontale (test)
// Modifier une activité ici la met à jour dans les deux affichages.
//
// Champs :
//   name     : titre affiché
//   image    : chemin dans /public
//   accroche : une ligne de résumé (visible avant de lire le détail)
//   desc     : description complète
//   tags     : mots-clés courts
//   href     : (optionnel) ancre vers une section qui détaille l'activité

export const activites = [
  {
    name: 'Pilates',
    image: '/Images/SentierPilates.avif',
    accroche: 'Renforcement profond et posture',
    desc: 'Renforcement des muscles profonds de la posture et de l\'abdomen par la respiration. Attitude redressée, ventre rentré, dos fort et souple — et disparition progressive des douleurs cervicales et lombaires. Se pratique aussi avec ballon, lestes et ring cercle.',
    tags: ['Gainage', 'Posture', 'Concentration'],
  },
  {
    name: 'Yoga',
    image: '/Images/SentierYoga.avif',
    accroche: 'Respiration, souplesse et apaisement',
    desc: 'Technique ancestrale d\'Inde : par la respiration et des enchaînements de postures adaptés à votre niveau, dénouez les tensions et libérez le mouvement. Plus de souplesse, des articulations libérées, une sensation d\'apaisement et de légèreté.',
    tags: ['Souplesse', 'Apaisement', 'Mobilité'],
  },
  {
    name: 'Yogilates & autres méthodes douces',
    image: '/Images/SentierYogilates.avif',
    accroche: 'Yoga et pilates réunis',
    desc: 'Fusion de yoga et de pilates : postures yogiques et répétitions pilates pour un renforcement profond et un allongement optimal de la posture. Découvrez aussi la Méthode de Gasquet, la gym hypopressive et la méthode Mézières, ainsi que des ateliers équilibre, mémoire et agilité — toujours au rythme de la respiration.',
    tags: ['Renforcement', 'Équilibre', 'Respiration'],
  },
  {
    name: 'Gym Bien-être',
    image: '/Images/SentierGymBienEtre.avif',
    accroche: 'Cardio, tonicité et équilibre',
    desc: 'Un mélange harmonieux de cardio ludique, de renforcement musculaire et d\'étirements. La séance échauffe motricité et muscles, enchaîne Pilates, gym douce et renforcement avec charges, puis se clôture par des postures d\'équilibre et d\'assouplissement.',
    tags: ['Cardio', 'Tonicité', 'Équilibre'],
  },
  {
    name: 'Forme & Force',
    image: '/Images/SentierFormeForce.avif',
    accroche: 'Tonification et prévention',
    desc: 'Entraînement cardio et renforcement musculaire ciblé pour tonifier le corps et rétablir les équilibres. Gainage et travail des zones articulaires (genoux, hanches, épaules) pour prévenir les douleurs et bouger durablement.',
    tags: ['Cardio', 'Tonification', 'Prévention'],
  },
  {
    name: 'Prestations sur mesure',
    image: '/Images/SentierPrestations.avif',
    accroche: 'Pour groupes et événements',
    desc: 'Association, comité d\'entreprise, organisateur d\'événements, groupe d\'amis ou particulier : des interventions sur-mesure adaptées à vos envies — yoga, Pilates, marche nordique, massages bien-être.',
    tags: ['Sur mesure', 'Groupes', 'Événements'],
    href: '#bespoke',
  },
  {
    name: 'Yin Yoga',
    image: '/Images/SentierYinYoga.avif',
    accroche: 'Une pratique tout en lenteur',
    desc: 'Postures tenues longuement, dans le calme et la pénombre, pour relâcher en profondeur le corps et l\'esprit. Une parenthèse de douceur qui rejoint prochainement l\'offre M\'GYM.',
    tags: ['Détente', 'Lâcher-prise', 'Bientôt disponible'],
  },
  {
    name: 'Accompagnement sur mesure',
    image: '/Images/SentierAccompagnement.avif',
    accroche: 'Un suivi personnalisé, à votre rythme',
    desc: 'Un accompagnement individuel pensé pour vos objectifs et votre rythme : conseils et activités adaptées, en complément des cours collectifs. Bientôt détaillé ici.',
    tags: ['Personnalisé', 'Bientôt disponible'],
  },
]
