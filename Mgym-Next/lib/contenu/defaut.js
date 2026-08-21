// defaut.js — le contenu du site tel qu'il existe aujourd'hui, converti
// dans la forme exacte que les composants attendent.
//
// POURQUOI CE FICHIER EXISTE
// Il joue trois rôles à lui seul :
//
//   1. REPLI. Si Sanity est injoignable, ou si un champ n'a pas encore été
//      rempli, le site affiche ce contenu au lieu d'une section vide. Le
//      site ne peut donc pas « tomber » à cause du CMS.
//
//   2. ÉTAT INITIAL. Tant qu'aucun projet Sanity n'est configuré, le site
//      fonctionne exactement comme avant. L'ajout du CMS ne casse rien le
//      jour où il est branché.
//
//   3. SOURCE DE LA MIGRATION. Le script d'import lit ce même fichier :
//      ce que la cliente retrouvera dans son back-office est donc, par
//      construction, ce qu'affiche le site.
//
// Les textes bruts viennent de source-historique.mjs. Ici, on les met en
// forme : texte riche en Portable Text, images en { src, alt }.

import {
  activites as activitesBrutes,
  creneaux as creneauxBruts,
  nomsAffiches,
  siteContent as brut,
  infosPratiques as infosBrutes,
  seoGlobal as seoBrut,
  images as imagesBrutes,
} from './source-historique.mjs'

// ── Mise en forme ───────────────────────────────────────────────

let compteur = 0
const cle = () => `d${(compteur++).toString(36)}`

/**
 * Convertit une chaîne, ou une liste de fragments { texte, gras }, en
 * Portable Text — la forme que Sanity renverra pour les mêmes champs.
 * Les composants n'ont ainsi qu'un seul format à savoir afficher.
 */
export function enTexteRiche(entree) {
  if (!entree) return []
  const fragments = typeof entree === 'string' ? [{ texte: entree }] : entree

  // Les liens sont des « markDefs » : une définition à part, référencée
  // par sa clé depuis le fragment. C'est ainsi que Sanity les enregistre.
  const markDefs = []
  const children = fragments.map((f) => {
    const marks = f.gras ? ['strong'] : []
    if (f.lien) {
      const cleLien = cle()
      markDefs.push({ _type: 'lien', _key: cleLien, href: f.lien, nouvelOnglet: !f.lien.startsWith('#') })
      marks.push(cleLien)
    }
    return { _type: 'span', _key: cle(), text: f.texte, marks }
  })

  return [{ _type: 'block', _key: cle(), style: 'normal', markDefs, children }]
}

/** Les champs de siteContent qui sont du texte riche. */
const CHAMPS_RICHES = [
  'citationBandeau', 'aProposTexte', 'aProposConclusion', 'outdoorTexte',
  'bespokeTexte', 'coachTexte', 'tarifsSurMesure', 'inscriptionAlerte',
  'planningChapo', 'contactCtaSousTitre',
]

const siteContent = Object.fromEntries(
  Object.entries(brut).map(([champ, valeur]) => [
    champ,
    CHAMPS_RICHES.includes(champ) ? enTexteRiche(valeur) : valeur,
  ])
)

// Les images locales sont déjà des chemins servis par Next depuis /public.
for (const [champ, info] of Object.entries(imagesBrutes)) {
  siteContent[champ] = {
    src: info.fichier.replace(/^public/, ''),
    alt: info.alt,
  }
}

// Les activités prennent la même forme que celle renvoyée par Sanity.
const activites = activitesBrutes.map((a, i) => ({
  _id: `defaut-activite-${i}`,
  titre: a.name,
  slug: null,
  descriptionCourte: a.accroche,
  descriptionRiche: enTexteRiche(a.desc),
  image: { src: a.image, alt: a.name },
  motsCles: a.tags,
  ordreAffichage: i + 1,
  lienInterne: a.href ?? null,
  libelleLien: a.lienTexte ?? null,
}))

// Les créneaux prennent la forme que renvoie Sanity : l'activité est un
// objet, pas un nom. Le composant Planning n'a donc qu'un cas à traiter.
// `nomsAffiches` conserve les libellés qui diffèrent du nom de l'activité
// (« Yoga postural » pour l'activité « Yoga ») : c'est ce que le site
// affiche aujourd'hui, et le perdre serait une régression visible.
const creneaux = creneauxBruts.map((c, i) => ({
  _id: `defaut-creneau-${i}`,
  jour: c.jour,
  heureDebut: c.heureDebut,
  duree: c.duree,
  actif: true,
  activite: {
    _id: `defaut-activite-${c.activite}`,
    titre: nomsAffiches[`${c.jour}|${c.heureDebut}`] ?? c.activite,
  },
}))

export const contenuDefaut = {
  site: siteContent,
  infos: infosBrutes,
  seo: seoBrut,
  activites,
  creneaux,
}
