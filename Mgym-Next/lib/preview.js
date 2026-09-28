// preview.js — l'ouverture et la fermeture du mode prévisualisation.
//
// La partie cryptographique vit dans preview-jeton.js, qui n'importe ni
// Next ni 'server-only' : c'est ce qui la rend testable. Ce fichier-ci ne
// fait que la brancher sur les cookies de Next.

import 'server-only'
import { cookies, draftMode } from 'next/headers'
import { creerJeton, jetonValide, optionsCookiePreview, DUREE_PREVIEW_MS } from './preview-jeton.js'

export { DUREE_PREVIEW_MS }

/** Nom du cookie qui porte la date limite signée. */
const COOKIE_EXPIRATION = 'mgym-preview-expire'

/**
 * Lit le secret, en refusant un secret trop court. Un secret de six
 * caractères se trouve par force brute ; la longueur minimale n'est pas
 * décorative.
 */
function secret() {
  const s = process.env.SANITY_PREVIEW_SECRET
  if (!s || s.length < 16) {
    throw new Error(
      "SANITY_PREVIEW_SECRET est absent ou trop court (16 caractères minimum).\n" +
      'Générez-en un : node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    )
  }
  return s
}

/** Le cookie de Next qui porte le mode brouillon. */
const COOKIE_BROUILLON = '__prerender_bypass'

const enProduction = () => process.env.NODE_ENV === 'production'

/**
 * Ouvre une session : active le mode brouillon de Next et pose le cookie
 * d'expiration signé.
 *
 * `cadreTiers` : la demande vient de l'aperçu du Studio, qui encadre le
 * site depuis un autre domaine. Les DEUX cookies — celui de Next et le
 * nôtre — reçoivent alors l'attribut Partitioned, sans lequel Safari les
 * jette (voir optionsCookiePreview). Le cookie de Next est donc réécrit
 * juste après que Next l'a posé : même valeur, attributs complétés.
 *
 * @param {{dureeMs?: number, cadreTiers?: boolean}} [options]
 */
export async function ouvrirPreview({ dureeMs = DUREE_PREVIEW_MS, cadreTiers = false } = {}) {
  const brouillon = await draftMode()
  brouillon.enable()

  const magasin = await cookies()
  const attributs = optionsCookiePreview({ production: enProduction(), cadreTiers })
  magasin.set(COOKIE_EXPIRATION, creerJeton(secret(), Date.now() + dureeMs), {
    ...attributs,
    maxAge: Math.floor(dureeMs / 1000),
  })
  const valeurNext = magasin.get(COOKIE_BROUILLON)?.value
  if (valeurNext) magasin.set(COOKIE_BROUILLON, valeurNext, attributs)
}

/**
 * Ferme la session et efface les deux cookies. Un cookie partitionné ne
 * s'efface qu'avec le même attribut : on les expire donc avec les attributs
 * qui ont servi à les poser.
 *
 * @param {{cadreTiers?: boolean}} [options]
 */
export async function fermerPreview({ cadreTiers = false } = {}) {
  const brouillon = await draftMode()
  brouillon.disable()
  const magasin = await cookies()
  const attributs = optionsCookiePreview({ production: enProduction(), cadreTiers })
  magasin.set(COOKIE_EXPIRATION, '', { ...attributs, maxAge: 0 })
  if (cadreTiers) magasin.set(COOKIE_BROUILLON, '', { ...attributs, maxAge: 0 })
}

/**
 * LA fonction que les pages appellent. Elle ne se contente pas de
 * `draftMode().isEnabled` : elle vérifie aussi que la session n'a pas
 * expiré et que le cookie n'a pas été fabriqué à la main.
 *
 * @returns {Promise<boolean>}
 */
export async function previewActif() {
  // Garde-fou pour la copie hors-ligne livrée à la cliente : en mode
  // export statique il n'y a ni serveur, ni requête, ni cookie. Appeler
  // draftMode() ferait basculer la page en rendu dynamique et casserait
  // le build. On répond « pas de prévisualisation » sans rien lire.
  if (process.env.MGYM_EXPORT === '1') return false

  const brouillon = await draftMode()
  if (!brouillon.isEnabled) return false

  const jeton = (await cookies()).get(COOKIE_EXPIRATION)?.value
  return jetonValide(jeton, process.env.SANITY_PREVIEW_SECRET)
}
