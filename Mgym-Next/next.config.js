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

const nextConfig = {
  ...(enExport ? { output: 'export' } : {}),
}

module.exports = nextConfig
