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
  motsCles, ordreAffichage, rubrique, lienInterne, libelleLien
}`

const EVENEMENT_CHAMPS = `{
  _id, titre, "slug": slug.current,
  dateDebut, dateFin, lieu, prix, placesMax,
  statut, lienInscription,
  "image": image${IMAGE},
  "description": description${TEXTE_RICHE},
  "activite": activite->{ _id, titre, "slug": slug.current }
}`

// « debut » : le texte brut de l'article, pour fabriquer un résumé quand la
// cliente n'en a pas écrit (voir lib/resume.js).
const ARTICLE_RESUME = `{
  _id, titre, "slug": slug.current,
  extrait, "debut": pt::text(corps), auteur, datePublication,
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

// Le document ENTIER, sans liste de champs : le schéma
// (sanity/schemaTypes/siteContent.js) est la seule description des
// champs. Avant, chaque champ était recopié ici ET dans le contenu par
// défaut ; un oubli (arrivé deux fois) donnait un champ rempli pour rien.
// Les images et textes riches arrivent bruts : lib/contenu/index.js et
// TexteRiche.js savent les lire.
// Par IDENTIFIANT et non par type : un second document du même type (un
// test, une copie) ne peut pas prendre la place du vrai.
export const SITE_CONTENT = `*[_id == "siteContent"][0]`

// Tout le document ; seuls les fichiers PDF sont transformés en adresse.
export const INFOS_PRATIQUES = `*[_id == "infosPratiques"][0]{
  ...,
  "plaquetteGroupes": plaquetteGroupes.asset->url,
  "plaquetteMassages": plaquetteMassages.asset->url,
  "reglementInterieur": reglementInterieur.asset->url,
  "conditionsGenerales": conditionsGenerales.asset->url
}`

export const SEO_GLOBAL = `*[_id == "seoGlobal"][0]`

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
    _id, jour, heureDebut, duree, niveau, placesMax, actif,
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

export const SLUGS_EVENEMENTS = `
  *[_type == "evenement" && defined(slug.current)]{ "slug": slug.current }
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
