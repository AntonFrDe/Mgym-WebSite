// revalidation.js — à quelle fréquence le site relit le CMS.
//
// POURQUOI CE FICHIER EXISTE
//
// Le site est statique : chaque page est fabriquée une fois, puis servie
// telle quelle. Publier dans Sanity ne la change donc pas — il faut que
// quelqu'un reconstruise le site.
//
// Chez un hébergeur comme Vercel, ce « quelqu'un » est le Deploy Hook :
// Sanity l'appelle à la publication, le site se reconstruit. Sur une
// machine qui fait simplement tourner `npm start`, personne n'appelle
// rien, et le site resterait figé sur le contenu du dernier build.
//
// La régénération incrémentale comble ce trou : passé ce délai, la
// première visite déclenche en arrière-plan une relecture du CMS et une
// nouvelle version de la page. Le visiteur suivant l'obtient. Aucune
// commande à lancer, aucune porte à ouvrir sur la machine.
//
// Ce n'est PAS du rendu dynamique : les pages restent statiques et
// servies depuis le cache. C'est le contenu qui a une date de péremption.
//
// Next exige que `export const revalidate` soit une valeur analysable
// statiquement : ce ne peut pas être une variable d'environnement. Pour
// changer le délai, on modifie cette constante et on reconstruit.

/**
 * Délai en secondes avant qu'une page ne redemande son contenu au CMS.
 *
 * 60 secondes : la cliente publie, patiente le temps d'un café, et
 * rafraîchit. Descendre plus bas multiplierait les appels à Sanity sans
 * gain perceptible — personne ne recharge une page d'accueil trois fois
 * par minute pour vérifier une virgule.
 */
export const DELAI_REVALIDATION = 60
