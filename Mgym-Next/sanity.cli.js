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
})
