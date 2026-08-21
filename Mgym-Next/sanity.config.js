// sanity.config.js — la recette qui fabrique le back-office.
//
// Ce fichier ne décrit PAS le site : il décrit l'interface d'administration
// que la cliente ouvrira dans son navigateur. Les champs déclarés dans
// sanity/schemaTypes/ deviennent les formulaires qu'elle remplit.
//
// Le Studio est déployé SÉPARÉMENT du site (npm run studio:deploy), et non
// embarqué dans une route Next. Trois raisons :
//   1. le site public ne transporte pas les ~2 Mo de JavaScript du Studio ;
//   2. l'administration reste accessible même si le site est en cours de
//      reconstruction ;
//   3. le site peut rester un export statique si on le souhaite un jour,
//      ce qu'une route /studio interdirait.

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemaTypes'

// Le CLI Sanity n'injecte dans le bundle du Studio que les variables
// préfixées SANITY_STUDIO_. Celles de Next (NEXT_PUBLIC_) lui sont
// invisibles : c'est pourquoi .env.local en contient deux jeux.
const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

if (!projectId) {
  throw new Error(
    "SANITY_STUDIO_PROJECT_ID est absent.\n" +
    "Copiez .env.example en .env.local et renseignez l'identifiant du " +
    "projet, visible sur sanity.io/manage."
  )
}

export default defineConfig({
  name: 'mgym',
  title: "M'GYM — Administration du site",

  projectId,
  dataset,

  plugins: [
    // Le menu latéral. Sa structure métier arrive en Phase 4 ; pour
    // l'instant le Studio affiche la liste brute des types.
    structureTool(),

    // Vision : une console pour tester des requêtes GROQ. Réservée au
    // développement — la cliente n'a rien à y faire, et un rôle « editor »
    // n'y a de toute façon pas accès en écriture.
    ...(process.env.NODE_ENV === 'development' ? [visionTool()] : []),
  ],

  schema: {
    types: schemaTypes,
  },
})
