// preview.js — l'ouverture et la fermeture du mode prévisualisation.
//
// La partie cryptographique vit dans preview-jeton.js, qui n'importe ni
// Next ni 'server-only' : c'est ce qui la rend testable. Ce fichier-ci ne
// fait que la brancher sur les cookies de Next.

import 'server-only'
import { cookies, draftMode } from 'next/headers'
import { creerJeton, jetonValide, DUREE_PREVIEW_MS } from './preview-jeton.js'

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

/**
 * Ouvre une session : active le mode brouillon de Next et pose le cookie
 * d'expiration signé.
 */
export async function ouvrirPreview() {
  const magasin = await cookies()

  magasin.set(COOKIE_EXPIRATION, creerJeton(secret()), {
    httpOnly: true,   // invisible au JavaScript de la page
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: Math.floor(DUREE_PREVIEW_MS / 1000),
  })

  const brouillon = await draftMode()
  brouillon.enable()
}

/** Ferme la session et efface les deux cookies. */
export async function fermerPreview() {
  const brouillon = await draftMode()
  brouillon.disable()
  const magasin = await cookies()
  magasin.delete(COOKIE_EXPIRATION)
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
