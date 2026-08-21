// liens.js — les adresses de contact et des formulaires en ligne, réunies ici
// pour n'avoir qu'UN SEUL endroit à modifier le jour où l'une d'elles change.

// ── Coordonnées de l'association ────────────────────────────────
// Le numéro existe sous deux formes : celle que compose le téléphone (sans
// espaces) et celle que lit un humain. Les séparer évite d'avoir à choisir
// entre un lien qui fonctionne et un affichage lisible.
export const TELEPHONE = '0609316145'
export const TELEPHONE_AFFICHE = '06 09 31 61 45'
export const EMAIL = 'gym.mirepoix@gmail.com'
//
// ── COMMENT RÉCUPÉRER LE LIEN D'UN FORMULAIRE GOOGLE ──────────────
// 1. Ouvrir le formulaire sur forms.google.com
// 2. Cliquer sur le bouton « Envoyer » en haut à droite
// 3. Choisir l'onglet en forme de maillon de chaîne (« Lien »)
// 4. Cocher « Réduire l'URL » si on veut une adresse plus courte
// 5. Cliquer sur « Copier », puis coller l'adresse ci-dessous entre les
//    apostrophes.
//
// Tant qu'une adresse reste vide (''), le bouton correspondant renvoie vers
// la section Contact du site plutôt que vers un lien mort.

// Formulaire d'INSCRIPTION / ADHÉSION, hébergé par Google Forms.
// Il demande : coordonnées, activité(s) souhaitée(s), formule tarifaire
// choisie, et historique personnel (santé, pratique sportive antérieure).
//
// Les réponses arrivent dans Google Forms, PAS sur ce site : le site est
// composé de pages statiques, il n'a aucun moyen de recevoir ou de stocker
// quoi que ce soit. Pour relire les inscriptions, ouvrir le formulaire sur
// forms.google.com, onglet « Réponses ».
export const LIEN_INSCRIPTION =
  'https://docs.google.com/forms/d/e/1FAIpQLSfqoi9Av_zujJlbOBs7TyrmRJ9JxAHYhgBqMFb6V_IGQSo7AQ/viewform'

// Formulaire d'inscription aux STAGES ponctuels (voir Planning.js).
// C'est un formulaire différent de celui de l'adhésion.
export const LIEN_STAGES = ''

// Vraie adresse ou repli sur la section Contact : un bouton doit toujours
// mener quelque part, jamais dans le vide.
export const destination = (lien) => lien || '#contact'

// Un lien externe s'ouvre dans un nouvel onglet pour ne pas faire perdre
// la page au visiteur ; une ancre interne, non.
export const attributsLienExterne = (lien) =>
  lien ? { target: '_blank', rel: 'noopener noreferrer' } : {}
