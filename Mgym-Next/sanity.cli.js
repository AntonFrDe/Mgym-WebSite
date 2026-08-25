// sanity.cli.js — configuration des commandes `sanity ...`.
//
// Distinct de sanity.config.js : celui-ci s'exécute dans Node au moment
// des commandes (dev, build, deploy), l'autre s'exécute dans le navigateur
// à l'intérieur du Studio.

import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },

  // L'adresse publique du back-office : https://mgym.sanity.studio
  //
  // Elle est ici plutôt que saisie à la main au moment du déploiement,
  // pour deux raisons : `sanity deploy` la demande sinon à chaque fois,
  // et surtout c'est une adresse que la cliente met en favori. La voir
  // dans un fichier versionné évite qu'un déploiement distrait la change
  // et casse son signet sans que personne ne s'en aperçoive.
  studioHost: 'mgym',

  // Identifiant de l'application créée par le premier déploiement. Sans
  // lui, `sanity deploy` redemande à quelle application publier — et une
  // réponse distraite créerait un second Studio à côté du bon.
  deployment: {
    appId: 'boxdaz4dq35cp6n8w9v3z44x',
  },
})
