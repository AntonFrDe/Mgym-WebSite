// pictogrammes.js — TOUS les petits dessins du site, à un seul endroit.
//
// Le pied de page recopiait le tracé de Facebook pour chaque réseau : le
// jour où Instagram a été ajouté, il se serait affiché avec un « f ».
// Réseaux, pied de page, publics des prestations, onglets et fiches
// d'événement puisent désormais ici.
//
// Deux familles, parce que deux styles de dessin :
//   RESEAUX — logos PLEINS (fill), ceux des marques ;
//   TRAITS  — pictogrammes au TRAIT (stroke), ceux du site.

export const RESEAUX = {
  facebook: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z',
  instagram: 'M12 2c2.7 0 3.1 0 4.1.06 1 .05 1.7.2 2.3.44a4.6 4.6 0 011.7 1.1 4.6 4.6 0 011.1 1.7c.24.6.4 1.3.44 2.3.06 1 .06 1.4.06 4.1s0 3.1-.06 4.1c-.05 1-.2 1.7-.44 2.3a4.9 4.9 0 01-2.8 2.8c-.6.24-1.3.4-2.3.44-1 .06-1.4.06-4.1.06s-3.1 0-4.1-.06c-1-.05-1.7-.2-2.3-.44a4.9 4.9 0 01-2.8-2.8c-.24-.6-.4-1.3-.44-2.3C2 15.1 2 14.7 2 12s0-3.1.06-4.1c.05-1 .2-1.7.44-2.3a4.9 4.9 0 012.8-2.8c.6-.24 1.3-.4 2.3-.44C8.9 2 9.3 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm6.4-.8a1.2 1.2 0 10-2.4 0 1.2 1.2 0 002.4 0zM12 9a3 3 0 110 6 3 3 0 010-6z',
  youtube: 'M23 12s0-3.2-.4-4.7a2.5 2.5 0 00-1.7-1.7C19.4 5.2 12 5.2 12 5.2s-7.4 0-8.9.4a2.5 2.5 0 00-1.7 1.7C1 8.8 1 12 1 12s0 3.2.4 4.7c.2.9.9 1.5 1.7 1.7 1.5.4 8.9.4 8.9.4s7.4 0 8.9-.4a2.5 2.5 0 001.7-1.7c.4-1.5.4-4.7.4-4.7zM9.7 15.3V8.7l6.2 3.3-6.2 3.3z',
  whatsapp: 'M12 2a10 10 0 00-8.6 15L2 22l5.1-1.3A10 10 0 1012 2zm5.8 14.2c-.2.7-1.2 1.3-1.7 1.3-.4 0-1 .1-3.2-.8-2.7-1.1-4.4-3.9-4.5-4-.1-.2-1-1.4-1-2.6s.6-1.8.9-2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.3 0 .5l-.4.5-.3.3c-.1.1-.2.3 0 .5l1.1 1.6c.7.7 1.3 1 1.5 1.1.2.1.4.1.5-.1l.7-.8c.2-.2.3-.2.5-.1l2 1c.2.1.3.2.4.3.1.2.1.8-.1 1.5z',
}

export const NOMS_RESEAUX = {
  facebook: 'Facebook', instagram: 'Instagram', youtube: 'YouTube', whatsapp: 'WhatsApp',
}

export const TRAITS = {
  lien: 'M10 13a5 5 0 007.5.5l3-3a5 5 0 00-7-7l-1.7 1.7M14 11a5 5 0 00-7.5-.5l-3 3a5 5 0 007 7l1.7-1.7',
  personne: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4.5 21a7.5 7.5 0 0115 0',
  groupe: 'M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2.5 20.5a6.5 6.5 0 0113 0M16 4.3a3.5 3.5 0 010 6.4M18 14.2a6.5 6.5 0 013.5 6.3',
  entreprise: 'M4 21V5a1 1 0 011-1h9a1 1 0 011 1v16M15 9h4a1 1 0 011 1v11M2 21h20M8 8h3M8 12h3M8 16h3',
  massage: 'M12 21c-4.5 0-8-3.3-8-8 4.5 0 8 3.3 8 8zm0 0c4.5 0 8-3.3 8-8-4.5 0-8 3.3-8 8zm0 0V11m0 0C9.8 9 9.8 5.5 12 3c2.2 2.5 2.2 6 0 8z',
  evenement: 'M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1zm3 8h3v3H8z',
  etoile: 'M12 3l2.4 5.6 6.1.5-4.6 4 1.4 5.9L12 16l-5.3 3 1.4-5.9-4.6-4 6.1-.5z',
  ateliers: 'M12 3v2M5.6 5.6l1.4 1.4M3 12h2M19 12h2M17 7l1.4-1.4M9 18h6M10 21h4M12 7a5 5 0 00-3 9v2h6v-2a5 5 0 00-3-9z',
  surMesure: 'M4 12l4 4 8-8M20 8v11a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1h11',
  pleinAir: 'M3 20h18M7 20l5-10 5 10M12 10V6M9 5a3 3 0 016 0M6.5 14.5L4 20M17.5 14.5L20 20',
  horloge: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2',
  lieu: 'M12 21s-7-5.5-7-11a7 7 0 0114 0c0 5.5-7 11-7 11zm0-8.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  prix: 'M17 6.5A6 6 0 007.3 9M17 17.5A6 6 0 017.3 15M5 10.5h8M5 13.5h8',
  places: 'M8 11a3 3 0 100-6 3 3 0 000 6zM16 11a3 3 0 100-6 3 3 0 000 6zM2.5 19a5.5 5.5 0 0111 0M10.5 19a5.5 5.5 0 0111 0',
  document: 'M14 3H6a1 1 0 00-1 1v16a1 1 0 001 1h12a1 1 0 001-1V8zM14 3v5h5M9 13h6M9 17h4',
  itineraire: 'M3 11l18-8-8 18-2-8z',
  telephone: 'M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.5c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z',
  email: 'M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zM22 6l-10 7L2 6',
  fleche: 'M5 12h14M13 6l6 6-6 6',
}

/**
 * Un pictogramme au trait. `aria-hidden` : il double toujours un texte
 * voisin, le lecteur d'écran n'a pas à l'annoncer.
 *
 * @param {{nom: keyof typeof TRAITS, taille?: number, className?: string}} props
 */
export function Picto({ nom, taille = 20, className }) {
  return (
    <svg
      className={className}
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={TRAITS[nom] ?? TRAITS.etoile} />
    </svg>
  )
}

/** Le logo plein d'un réseau social ; un réseau inconnu retombe sur le maillon. */
export function LogoReseau({ nom, taille = 18 }) {
  if (!RESEAUX[nom]) return <Picto nom="lien" taille={taille} />
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={RESEAUX[nom]} />
    </svg>
  )
}

/**
 * Le pictogramme d'un public visé (« Particulier », « Entreprise »…),
 * deviné d'après son libellé saisi dans le back-office. Un libellé inconnu
 * reçoit l'étoile : jamais de trou dans la carte.
 *
 * @param {string} libelle
 */
export function pictoPublic(libelle) {
  const t = String(libelle ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  if (t.includes('particul') || t.includes('individu') || t.includes('one to one')) return 'personne'
  if (t.includes('asso') || t.includes('groupe') || t.includes('amis') || t.includes('famille')) return 'groupe'
  if (t.includes('entreprise') || t.includes('comite') || t.includes('collectiv') || t.includes('cse')) return 'entreprise'
  if (t.includes('massag') || t.includes('detente') || t.includes('bien-etre')) return 'massage'
  if (t.includes('evenement') || t.includes('mariage') || t.includes('anniversaire')) return 'evenement'
  return 'etoile'
}
