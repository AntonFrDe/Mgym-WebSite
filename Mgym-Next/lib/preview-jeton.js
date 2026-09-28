// preview-jeton.js — la partie CRYPTOGRAPHIQUE de la prévisualisation.
//
// Séparée de preview.js pour une raison précise : preview.js importe
// 'server-only' et next/headers, donc rien ne peut le charger dans un
// test. Ces fonctions-ci sont pures, sans dépendance à Next, et donc
// vérifiables (voir preview-jeton.test.mjs).
//
// Un garde-fou qu'on ne peut pas tester n'est pas un garde-fou.

import { createHmac, timingSafeEqual } from 'node:crypto'

/** Durée d'une session de prévisualisation ouverte par lien secret. */
export const DUREE_PREVIEW_MS = 60 * 60 * 1000 // une heure

/**
 * Durée d'une session ouverte DEPUIS LE STUDIO (outil « Aperçu »). Plus
 * longue : la cliente garde l'aperçu ouvert pendant qu'elle travaille, et
 * une session expirée afficherait sans prévenir le contenu publié au lieu
 * de ses modifications. Le risque est moindre qu'avec le lien secret : le
 * Studio fabrique un secret neuf à chaque ouverture, lié à son compte.
 */
export const DUREE_STUDIO_MS = 8 * 60 * 60 * 1000 // une journée de travail

/**
 * La requête vient-elle d'un cadre (iframe) posé par un AUTRE site ?
 * C'est le cas de l'aperçu du Studio : mgym.sanity.studio encadre mgym.fr.
 * Les en-têtes Sec-Fetch-* sont posés par le navigateur, pas par la page.
 *
 * @param {{get: (nom: string) => string|null}} entetes
 */
export function depuisCadreTiers(entetes) {
  return entetes.get('sec-fetch-site') === 'cross-site' && entetes.get('sec-fetch-dest') === 'iframe'
}

/**
 * Les attributs des cookies de prévisualisation.
 *
 *   · En ligne (https) : Secure et SameSite=None — sans eux, un cookie posé
 *     dans le cadre du Studio n'est jamais renvoyé.
 *   · Dans un cadre tiers : Partitioned en plus. Safari 18.4+ (donc tout
 *     iPhone à jour) JETTE sinon le cookie d'un site encadré par un autre :
 *     l'aperçu du Studio afficherait le contenu publié. Le cookie est alors
 *     rangé « dans la partition du Studio » : il ne vaut que là.
 *   · En local (http) : SameSite=Lax, ni Secure ni Partitioned, que le
 *     navigateur refuserait sans https.
 *
 * @param {{production: boolean, cadreTiers?: boolean, dureeMs?: number}} options
 */
export function optionsCookiePreview({ production, cadreTiers = false, dureeMs }) {
  return {
    httpOnly: true,   // invisible au JavaScript de la page
    path: '/',
    secure: production,
    sameSite: production ? 'none' : 'lax',
    ...(production && cadreTiers ? { partitioned: true } : {}),
    ...(dureeMs ? { maxAge: Math.floor(dureeMs / 1000) } : {}),
  }
}

/**
 * Compare deux chaînes sans laisser fuir leur ressemblance par le temps
 * de réponse.
 *
 * `a === b` s'arrête au premier caractère différent : le temps de réponse
 * trahit alors le nombre de caractères justes, et un secret se devine
 * lettre par lettre. On compare donc des empreintes de longueur fixe, ce
 * qui empêche aussi la longueur elle-même de fuir.
 *
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export function egaliteConstante(a, b) {
  const ha = createHmac('sha256', 'comparaison').update(String(a ?? ''), 'utf8').digest()
  const hb = createHmac('sha256', 'comparaison').update(String(b ?? ''), 'utf8').digest()
  return timingSafeEqual(ha, hb)
}

/**
 * Fabrique un jeton « expiration.signature ».
 * La signature empêche de rallonger la date limite en modifiant le cookie.
 *
 * @param {string} secret
 * @param {number} [expiration]  horodatage en millisecondes
 */
export function creerJeton(secret, expiration = Date.now() + DUREE_PREVIEW_MS) {
  const signature = createHmac('sha256', secret).update(String(expiration)).digest('hex')
  return `${expiration}.${signature}`
}

/**
 * Vérifie un jeton : signature valide ET date limite non dépassée.
 *
 * @param {string|undefined|null} jeton
 * @param {string} secret
 * @param {number} [maintenant]  injectable, pour pouvoir tester l'expiration
 * @returns {boolean}
 */
export function jetonValide(jeton, secret, maintenant = Date.now()) {
  if (typeof jeton !== 'string' || !secret) return false

  const separateur = jeton.indexOf('.')
  if (separateur < 1) return false

  const expiration = jeton.slice(0, separateur)
  const signature = jeton.slice(separateur + 1)

  // Une date qui n'est pas un nombre est rejetée avant tout calcul.
  if (!/^\d+$/.test(expiration)) return false

  const attendue = createHmac('sha256', secret).update(expiration).digest('hex')
  if (!egaliteConstante(signature, attendue)) return false

  return Number(expiration) > maintenant
}

/**
 * N'accepte qu'un chemin INTERNE au site.
 *
 * Sans ce contrôle, un lien de prévisualisation deviendrait une
 * redirection ouverte : « /api/preview?chemin=https://site-piege.fr »
 * enverrait le visiteur ailleurs depuis une adresse de confiance.
 * `//evil.com` est refusé aussi : le navigateur le lit comme une adresse
 * absolue avec le protocole courant.
 *
 * @param {string|null|undefined} demande
 * @returns {string}
 */
export function cheminInterne(demande) {
  if (typeof demande !== 'string') return '/'
  if (!demande.startsWith('/')) return '/'
  if (demande.startsWith('//')) return '/'
  // Une barre oblique inversée est normalisée en barre par certains
  // navigateurs : /\evil.com deviendrait //evil.com.
  if (demande.startsWith('/\\')) return '/'
  return demande
}
