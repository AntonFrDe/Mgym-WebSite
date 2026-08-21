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
 * Les identifiants sont OPTIONNELS. Tant qu'ils sont absents, le site
 * affiche le contenu par défaut (lib/contenu/defaut.js) : c'est un état
 * de fonctionnement normal, pas une panne.
 *
 * Lever une erreur ici empêcherait le site de se construire avant que le
 * projet Sanity n'existe — exactement l'inverse de ce qu'on veut.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

// Date figée volontairement : elle verrouille le comportement de l'API.
// La faire avancer « pour être à jour » peut changer le résultat des
// requêtes sans prévenir.
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01'

/**
 * Le CMS est-il branché ? Un seul endroit répond à cette question.
 */
export const sanityConfigure = Boolean(projectId)
