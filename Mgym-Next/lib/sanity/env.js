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
 * Sans ces identifiants, le site n'a AUCUN texte : il n'y a plus de
 * contenu de secours dans le code. L'erreur est levée à la première
 * lecture (clientPour, lib/sanity/client.js), pas ici : les tests et
 * scripts qui importent ce fichier sans lire Sanity continuent de marcher.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

// Date figée volontairement : elle verrouille le comportement de l'API.
// La faire avancer « pour être à jour » peut changer le résultat des
// requêtes sans prévenir.
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01'

/**
 * L'adresse du back-office. Sert à l'aperçu (clic-pour-modifier : un texte
 * du site renvoie vers son champ) et à la CSP, qui n'autorise qu'elle à
 * afficher le site dans un cadre. En local : http://localhost:3333.
 */
export const studioUrl = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || 'https://mgym.sanity.studio'

/**
 * Le CMS est-il branché ? Un seul endroit répond à cette question.
 */
export const sanityConfigure = Boolean(projectId)
