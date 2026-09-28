/** @type {import('next').NextConfig} */

// L'export statique n'est PLUS le mode par défaut.
//
// POURQUOI CE CHANGEMENT
// `output: 'export'` interdit toute route serveur. Or la prévisualisation
// des brouillons en exige une : sans elle, la cliente publierait sans
// jamais pouvoir vérifier. Vérifié par un build réel :
//
//   Error: export const dynamic = "force-static" not configured on route
//          "/api/preview" with "output: export"
//
// CE QUE ÇA NE CHANGE PAS
// Le site reste entièrement généré au build et servi depuis un CDN.
// « export » ne veut pas dire « statique » : Next hébergé sur un runtime
// Node produit le même HTML pré-calculé. Le référencement et les
// performances sont identiques.
//
// MGYM_EXPORT=1 réactive l'export, uniquement pour fabriquer la copie
// hors-ligne livrée à la cliente (voir scripts/export-statique.mjs).
const enExport = process.env.MGYM_EXPORT === '1'

// ── HSTS : opt-in, et c'est délibéré ────────────────────────────
//
// `Strict-Transport-Security` ordonne au navigateur de n'utiliser que
// HTTPS sur ce domaine, pendant deux ans, sous-domaines compris. Il n'y a
// pas de marche arrière : l'en-tête est mémorisé par le navigateur du
// visiteur, pas par le serveur. Le retirer plus tard ne le désactive pas.
//
// Deux façons de se tirer une balle dans le pied :
//   · le servir sur un domaine sans certificat valide — le site devient
//     inaccessible, et le rester deux ans ;
//   · le servir depuis un domaine PARTAGÉ (*.trycloudflare.com,
//     *.ngrok-free.app) — `includeSubDomains` s'applique alors à tous les
//     sous-domaines de ce domaine, pour ce visiteur. On casse le site des
//     autres.
//
// Le commentaire précédent disait déjà « à n'activer qu'une fois le
// certificat en place », juste au-dessus d'une ligne qui l'activait
// toujours. La condition est maintenant réelle.
//
// À poser sur le domaine définitif, une fois HTTPS vérifié :
//   MGYM_HSTS=1
const hstsActif = process.env.MGYM_HSTS === '1'

// ── 'unsafe-eval' : en DÉVELOPPEMENT uniquement ─────────────────
//
// `next dev` compile les modules à la volée et les évalue avec eval()
// pour le rechargement à chaud. Sans cette autorisation, le navigateur
// refuse TOUT le JavaScript de la page :
//
//   EvalError: Evaluating a string as JavaScript violates the following
//   Content Security Policy directive... 'unsafe-eval' is not allowed
//
// React ne s'hydrate alors jamais. Le menu ne s'ouvre pas, les sections
// restent invisibles, le carrousel ne défile plus — et rien ne l'indique,
// sinon une ligne dans la console. Le site construit, lui, fonctionne :
// le défaut n'existe QU'EN développement, ce qui le rend trompeur.
//
// La production ne reçoit jamais cette autorisation : `next build` fixe
// NODE_ENV à 'production'.
const enDeveloppement = process.env.NODE_ENV !== 'production'

// L'adresse du back-office, seul site autorisé à encadrer celui-ci (aperçu).
const studioUrl = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || 'https://mgym.sanity.studio'

// ── En-têtes de sécurité ────────────────────────────────────────
// Chacun ferme une porte précise. Ils ne s'appliquent qu'au site hébergé :
// la copie hors-ligne n'a pas de serveur pour les émettre.
const enTetes = [
  // Empêche le navigateur de « deviner » le type d'un fichier. Sans lui,
  // un fichier texte contenant du HTML peut être exécuté comme une page.
  { key: 'X-Content-Type-Options', value: 'nosniff' },

  // (X-Frame-Options a été retiré : il ne sait autoriser que le même site,
  // et l'aperçu du Studio doit afficher le site dans un cadre. La même
  // protection contre le détournement de clic est assurée par
  // « frame-ancestors » dans la CSP ci-dessous, avec une liste précise.)

  // Une adresse de prévisualisation ne fuite pas vers les sites visités
  // ensuite : on n'envoie que le domaine, jamais le chemin complet.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

  // Le site n'a besoin ni de la caméra, ni du micro, ni de la position.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },

  // Voir le bloc « HSTS » en haut du fichier : absent par défaut, présent
  // seulement si MGYM_HSTS=1.
  ...(hstsActif
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }]
    : []),

  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Les images du CMS sont servies par le CDN de Sanity. `data:` sert
      // aux images intégrées de la copie hors-ligne.
      "img-src 'self' data: https://cdn.sanity.io",
      // Les polices sont auto-hébergées par next/font : aucun domaine tiers.
      "font-src 'self'",
      // Next produit des styles en ligne pour le rendu initial ; il n'y a
      // pas de moyen de les supprimer sans casser l'affichage.
      "style-src 'self' 'unsafe-inline'",
      // 'unsafe-inline' est nécessaire aux scripts d'hydratation de Next.
      // L'alternative — des nonces — imposerait un rendu DYNAMIQUE à
      // chaque requête et ferait perdre la mise en cache CDN de tout le
      // site. Compromis assumé et documenté dans SECURITY.md : ce site
      // n'a ni saisie utilisateur, ni authentification, ni script tiers.
      `script-src 'self' 'unsafe-inline'${enDeveloppement ? " 'unsafe-eval'" : ''}`,
      // Aucune requête sortante en dehors du CMS.
      "connect-src 'self' https://*.api.sanity.io https://*.apicdn.sanity.io",
      // Seul le back-office peut afficher le site dans un cadre : c'est
      // l'outil « Aperçu » (voir sanity/lib/presentation.js). sanity.io y
      // figure parce que le tableau de bord de Sanity ouvre lui-même le
      // Studio dans un cadre. Tout autre site est refusé : pas de
      // détournement de clic possible.
      // Le site, lui, n'encadre qu'UNE chose : le plan OpenStreetMap de la
      // section Contact (voir Contact.js).
      `frame-ancestors 'self' ${studioUrl} https://www.sanity.io${enDeveloppement && !studioUrl.includes('localhost') ? ' http://localhost:3333' : ''}`,
      "frame-src https://www.openstreetmap.org",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
]

const nextConfig = {
  ...(enExport ? { output: 'export' } : {}),

  // headers() n'existe pas en mode export : il n'y a pas de serveur pour
  // les émettre. On ne les déclare donc que pour le site hébergé.
  ...(enExport
    ? {}
    : { async headers() { return [{ source: '/:chemin*', headers: enTetes }] } }),
}

module.exports = nextConfig
