// DonneesStructurees.js — la fiche que Google lit pour comprendre le site.
//
// Ce sont les données qui permettent d'afficher l'adresse, le téléphone et
// les horaires directement dans les résultats de recherche. Invisibles
// pour le visiteur, elles ne changent rien à la page.
//
// POURQUOI dangerouslySetInnerHTML EST UTILISÉ ICI, ET NULLE PART AILLEURS
// Une balise <script type="application/ld+json"> doit contenir du texte
// brut : React refuse d'y placer un enfant autrement. C'est le seul moyen.
//
// Le risque est neutralisé de deux façons :
//   1. le contenu est fabriqué par JSON.stringify — jamais une chaîne
//      assemblée à la main ;
//   2. les caractères qui pourraient refermer la balise (< > &) sont
//      échappés en séquences Unicode, que JSON comprend et que le parseur
//      HTML ignore. Même un texte contenant « </script> » saisi dans le
//      back-office ne peut donc pas s'échapper de la balise.

/**
 * Rend une valeur JSON sûre à l'intérieur d'une balise <script>.
 * @param {unknown} donnees
 */
function jsonSur(donnees) {
  return JSON.stringify(donnees)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

/**
 * @param {{infos: object, seo: object, activites: any[]}} props
 */
export default function DonneesStructurees({ infos, seo, activites = [] }) {
  const [rue, villeEtCode] = String(infos.adresse ?? '').split('\n')
  const codePostal = villeEtCode?.match(/\d{5}/)?.[0]
  const ville = villeEtCode?.replace(/\d{5}\s*/, '').trim()

  const fiche = {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    name: "M'GYM — Bien-être & Santé",
    description: seo.description,
    ...(seo.urlCanonique ? { url: seo.urlCanonique } : {}),
    ...(seo.imagePartage?.src ? { image: seo.imagePartage.src } : {}),
    ...(infos.telephone ? { telephone: infos.telephone } : {}),
    ...(infos.email ? { email: infos.email } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(rue ? { streetAddress: rue } : {}),
      ...(codePostal ? { postalCode: codePostal } : {}),
      ...(ville ? { addressLocality: ville } : {}),
      addressCountry: 'FR',
    },
    ...(infos.reseauxSociaux?.length
      ? { sameAs: infos.reseauxSociaux.map((r) => r.url).filter(Boolean) }
      : {}),
    ...(activites.length
      ? {
          makesOffer: activites.map((a) => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: a.titre },
          })),
        }
      : {}),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonSur(fiche) }}
    />
  )
}
