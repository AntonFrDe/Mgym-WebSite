// groq.js — TOUTES les requêtes du projet, et rien que des chaînes.
//
// Ce fichier ne fait aucun appel réseau et n'importe pas 'server-only' :
// c'est ce qui permet de le charger dans un script de test et de vérifier
// que chaque requête compile (npm run groq:check). Une requête cassée est
// alors détectée au moment du commit, pas en production.
//
// RÈGLE DE SÉCURITÉ : aucune valeur variable n'est concaténée ici. Les
// données venant de l'extérieur — un slug d'URL, une date — sont passées
// en paramètres ($slug, $du, $au) et échappées par le client Sanity.
// Un `${...}` dans ce fichier ne peut interpoler qu'un FRAGMENT défini
// juste au-dessus, jamais une saisie utilisateur.

// ── Fragments réutilisés ────────────────────────────────────────

// Une image : la référence de l'asset, le recadrage, le texte alternatif.
// Sans `asset`, l'URL ne peut pas être fabriquée.
export const IMAGE = `{ "asset": asset, hotspot, crop, alt }`

// Un texte riche, avec les liens résolus.
export const TEXTE_RICHE = `[]{
  ...,
  markDefs[]{ ..., _type == "lien" => { href, nouvelOnglet } }
}`

const ACTIVITE_CHAMPS = `{
  _id, titre, "slug": slug.current,
  descriptionCourte,
  "descriptionRiche": descriptionRiche${TEXTE_RICHE},
  "image": image${IMAGE},
  motsCles, ordreAffichage, lienInterne, libelleLien
}`

const EVENEMENT_CHAMPS = `{
  _id, titre, "slug": slug.current,
  dateDebut, dateFin, lieu, prix, placesMax,
  statut, lienInscription,
  "image": image${IMAGE},
  "description": description${TEXTE_RICHE},
  "activite": activite->{ _id, titre, "slug": slug.current }
}`

const ARTICLE_RESUME = `{
  _id, titre, "slug": slug.current,
  extrait, auteur, datePublication,
  "image": image${IMAGE}
}`

const ARTICLE_COMPLET = `{
  _id, titre, "slug": slug.current,
  extrait, auteur, datePublication,
  seoTitre, seoDescription,
  "image": image${IMAGE},
  "corps": corps${TEXTE_RICHE}
}`

// ── Contenu éditorial (documents uniques) ───────────────────────

export const SITE_CONTENT = `*[_type == "siteContent"][0]{
  heroTitre, heroTitreItalique, heroActivites,
  heroBoutonActivites, heroBoutonContact,
  "heroImage": heroImage${IMAGE},
  "citationBandeau": citationBandeau${TEXTE_RICHE},

  aProposEtiquette, aProposTitre, aProposTitreItalique, aProposTitreFin,
  "aProposTexte": aProposTexte${TEXTE_RICHE},
  aProposAvantagesTitre, aProposAvantages,
  "aProposConclusion": aProposConclusion${TEXTE_RICHE},
  "aProposPhoto": aProposPhoto${IMAGE},
  aProposBadgeNombre, aProposBadgeLibelle,

  activitesEtiquette, activitesTitre, activitesTitreItalique, activitesChapo,

  outdoorEtiquette, outdoorTitre, outdoorTitreSuite, outdoorTitreItalique,
  "outdoorTexte": outdoorTexte${TEXTE_RICHE},
  "outdoorImage": outdoorImage${IMAGE},
  outdoorMotsCles,

  bespokeEtiquette, bespokeTitre, bespokeTitreItalique,
  "bespokeTexte": bespokeTexte${TEXTE_RICHE},
  bespokePublics, bespokeBouton,
  "bespokeImage": bespokeImage${IMAGE},

  coachEtiquette, coachPrenom, coachNom,
  "coachPhoto": coachPhoto${IMAGE},
  coachStatistiques[]{ nombre, libelle },
  "coachTexte": coachTexte${TEXTE_RICHE},
  coachCertifications,

  tarifsEtiquette, tarifsTitre, tarifsTitreItalique,
  adhesion{ nom, detail, prix },
  tarifsCarte[]{ nom, detail, prix },
  tarifsCarteNote,
  tarifsSaison[]{ nom, detail, prixUnePersonne, prixFamille },
  tarifsSaisonNote, tarifsFamilleNote,
  tarifsPartiels[]{ nom, detail, prix },
  "tarifsSurMesure": tarifsSurMesure${TEXTE_RICHE},
  inscriptionTitre, inscriptionTitreItalique, inscriptionSousTitre,
  inscriptionAnnonce, inscriptionEtapes,
  "inscriptionAlerte": inscriptionAlerte${TEXTE_RICHE},
  inscriptionBouton,

  planningEtiquette, planningTitre, planningTitreItalique,
  "planningChapo": planningChapo${TEXTE_RICHE},
  planningSaison, planningBouton,

  contactEtiquette, contactTitre, contactTitreItalique,
  contactCtaTitre, contactCtaTitreItalique,
  "contactCtaSousTitre": contactCtaSousTitre${TEXTE_RICHE},
  contactCtaAide,
  reseauxEtiquette, reseauxTitre, reseauxTitreItalique,

  footerSlogan, footerMention, footerBaseline
}`

export const INFOS_PRATIQUES = `*[_type == "infosPratiques"][0]{
  adresse, telephone, email, horairesAccueil,
  reseauxSociaux[]{ nom, url, libelle },
  lienInscription, lienStages
}`

export const SEO_GLOBAL = `*[_type == "seoGlobal"][0]{
  titre, description, urlCanonique,
  "imagePartage": imagePartage${IMAGE}
}`

// ── Activités ───────────────────────────────────────────────────

export const ACTIVITES = `
  *[_type == "activite" && actif == true]
  | order(ordreAffichage asc) ${ACTIVITE_CHAMPS}
`

export const ACTIVITE_PAR_SLUG = `
  *[_type == "activite" && slug.current == $slug][0] ${ACTIVITE_CHAMPS}
`

// ── Planning ────────────────────────────────────────────────────

export const CRENEAUX = `
  *[_type == "creneau" && actif == true] | order(jour asc, heureDebut asc) {
    _id, jour, heureDebut, duree, niveau, lieu, placesMax, actif,
    "activite": activite->{ _id, titre, "slug": slug.current }
  }
`

export const EXCEPTIONS = `
  *[_type == "exception" && date >= $du && date <= $au] | order(date asc) {
    _id, date, type, nouvelleHeure, motif,
    "creneauId": creneau._ref
  }
`

export const FERMETURES = `
  *[_type == "fermeture" && dateFin >= $du && dateDebut <= $au]
  | order(dateDebut asc) {
    _id, libelle, dateDebut, dateFin
  }
`

// ── Événements ──────────────────────────────────────────────────

export const EVENEMENTS_A_VENIR = `
  *[_type == "evenement" && dateDebut >= $maintenant]
  | order(dateDebut asc) ${EVENEMENT_CHAMPS}
`

export const EVENEMENT_PAR_SLUG = `
  *[_type == "evenement" && slug.current == $slug][0] ${EVENEMENT_CHAMPS}
`

// ── Articles ────────────────────────────────────────────────────

export const ARTICLES = `
  *[_type == "article"] | order(datePublication desc) ${ARTICLE_RESUME}
`

export const ARTICLE_PAR_SLUG = `
  *[_type == "article" && slug.current == $slug][0] ${ARTICLE_COMPLET}
`

export const SLUGS_ARTICLES = `
  *[_type == "article" && defined(slug.current)]{ "slug": slug.current }
`
