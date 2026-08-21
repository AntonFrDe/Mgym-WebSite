// env.js — lecture et VALIDATION des variables d'environnement Sanity,
// côté Next.js.
//
// Pourquoi valider plutôt que lire directement `process.env` partout :
// une variable oubliée produit sinon une erreur incompréhensible au fond
// d'une requête réseau. Ici, elle produit un message qui dit quoi faire.
//
// Les trois valeurs ci-dessous ne sont PAS des secrets. Elles apparaissent
// dans l'URL de l'API Sanity, visible par n'importe quel visiteur. Le
// préfixe NEXT_PUBLIC_ est donc volontaire. Les vrais secrets — token de
// lecture, secret de prévisualisation — n'ont jamais ce préfixe et sont
// lus ailleurs, uniquement côté serveur.

/**
 * @param {string} nom  nom de la variable
 * @param {string|undefined} valeur
 * @returns {string}
 */
function exigee(nom, valeur) {
  if (!valeur) {
    throw new Error(
      `Variable d'environnement manquante : ${nom}\n` +
      `Copiez .env.example en .env.local et renseignez cette valeur.\n` +
      `Elle se trouve sur sanity.io/manage, dans les réglages du projet.`
    )
  }
  return valeur
}

export const projectId = exigee(
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
)

export const dataset = exigee(
  'NEXT_PUBLIC_SANITY_DATASET',
  process.env.NEXT_PUBLIC_SANITY_DATASET
)

// Date figée volontairement : elle verrouille le comportement de l'API.
// La faire avancer « pour être à jour » peut changer le résultat des
// requêtes sans prévenir.
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01'
