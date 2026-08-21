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

// ── En-têtes de sécurité ────────────────────────────────────────
// Chacun ferme une porte précise. Ils ne s'appliquent qu'au site hébergé :
// la copie hors-ligne n'a pas de serveur pour les émettre.
const enTetes = [
  // Empêche le navigateur de « deviner » le type d'un fichier. Sans lui,
  // un fichier texte contenant du HTML peut être exécuté comme une page.
  { key: 'X-Content-Type-Options', value: 'nosniff' },

  // Le site ne peut pas être affiché dans une iframe sur un autre domaine :
  // c'est ce qui empêche le détournement de clic.
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },

  // Une adresse de prévisualisation ne fuite pas vers les sites visités
  // ensuite : on n'envoie que le domaine, jamais le chemin complet.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

  // Le site n'a besoin ni de la caméra, ni du micro, ni de la position.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },

  // Impose HTTPS pour deux ans. À n'activer qu'une fois le certificat en
  // place : un site en HTTP deviendrait inaccessible.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },

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
      "script-src 'self' 'unsafe-inline'",
      // Aucune requête sortante en dehors du CMS.
      "connect-src 'self' https://*.api.sanity.io https://*.apicdn.sanity.io",
      // Personne ne peut encadrer le site, et le site n'encadre personne.
      "frame-ancestors 'self'",
      "frame-src 'none'",
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
