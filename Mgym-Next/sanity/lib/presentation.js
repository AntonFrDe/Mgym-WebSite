// presentation.js — l'outil « Aperçu » du back-office (Presentation).
//
// La cliente voit le site À CÔTÉ de ce qu'elle modifie, mis à jour pendant
// qu'elle tape, et un clic sur un texte du site ouvre le champ correspondant.
// Sur téléphone (Studio 5.31 et plus), l'aperçu et le formulaire passent en
// onglets au lieu de se serrer côte à côte.
//
// Ce fichier dit à l'outil deux choses :
//   · OÙ se trouve le site, et quelle route active l'aperçu ;
//   · QUELLE page montre QUEL document (dans les deux sens).

import { defineDocuments, defineLocations } from 'sanity/presentation'

// L'adresse du site. En local, .env.local la remplace par
// http://localhost:3000 (SANITY_STUDIO_PREVIEW_ORIGIN) pour prévisualiser le
// site en cours de développement.
export const ORIGINE_SITE = process.env.SANITY_STUDIO_PREVIEW_ORIGIN || 'https://mgym.fr'

export const optionsApercu = {
  name: 'apercu',
  title: 'Aperçu',

  previewUrl: {
    origin: ORIGINE_SITE,
    preview: '/',
    // Les deux routes du site (app/api/draft-mode). Le Studio ne connaît
    // AUCUN secret : il en fabrique un à chaque ouverture, que la route
    // « enable » vérifie auprès de Sanity.
    previewMode: {
      enable: '/api/draft-mode/enable',
      disable: '/api/draft-mode/disable',
    },
  },

  // Les sites que l'aperçu a le droit d'afficher : le site, ses copies de
  // test Netlify (Deploy Previews), et le site en développement local.
  allowOrigins: [
    ORIGINE_SITE,
    'https://*frolicking-babka-da04a6.netlify.app',
    'http://localhost:*',
  ],

  resolve: {
    // Page → document : ouvrir une page dans l'aperçu ouvre le bon formulaire.
    mainDocuments: defineDocuments([
      { route: '/', filter: '_type == "siteContent" && _id == "siteContent"' },
      { route: '/evenements/:slug', filter: '_type == "evenement" && slug.current == $slug' },
      { route: '/blog/:slug', filter: '_type == "article" && slug.current == $slug' },
    ]),

    // Document → pages : le formulaire affiche « Utilisé sur … » avec des
    // liens qui ouvrent l'aperçu à la bonne page.
    locations: {
      evenement: defineLocations({
        select: { titre: 'titre', slug: 'slug.current' },
        resolve: (doc) => ({
          locations: [
            ...(doc?.slug ? [{ title: doc.titre || 'Fiche de l\'événement', href: `/evenements/${doc.slug}` }] : []),
            { title: 'Accueil — Stages & événements', href: '/#evenements' },
          ],
        }),
      }),
      article: defineLocations({
        select: { titre: 'titre', slug: 'slug.current' },
        resolve: (doc) => ({
          locations: [
            ...(doc?.slug ? [{ title: doc.titre || 'L\'article', href: `/blog/${doc.slug}` }] : []),
            { title: 'Le blog', href: '/blog' },
          ],
        }),
      }),
      activite: defineLocations({
        message: 'Les activités s\'affichent sur la page d\'accueil.',
        locations: [{ title: 'Accueil — Activités', href: '/#activites' }],
      }),
      siteContent: defineLocations({
        locations: [{ title: 'Page d\'accueil', href: '/' }],
      }),
      infosPratiques: defineLocations({
        locations: [{ title: 'Accueil — Contact', href: '/#contact' }],
      }),
      creneau: defineLocations({
        locations: [{ title: 'Accueil — Planning', href: '/#planning' }],
      }),
      exception: defineLocations({
        locations: [{ title: 'Accueil — Planning', href: '/#planning' }],
      }),
      fermeture: defineLocations({
        locations: [{ title: 'Accueil — Planning', href: '/#planning' }],
      }),
    },
  },
}
