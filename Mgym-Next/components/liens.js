// liens.js — les adresses des formulaires en ligne, réunies ici pour n'avoir
// qu'UN SEUL endroit à modifier le jour où un formulaire change d'adresse.
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

// Formulaire d'INSCRIPTION / ADHÉSION.
// Doit demander : coordonnées, activité(s) souhaitée(s), formule tarifaire
// choisie, et historique personnel (santé, pratique sportive antérieure).
export const LIEN_INSCRIPTION = ''

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
