// TexteRiche.js — affiche un texte saisi dans le back-office.
//
// SÉCURITÉ — aucun `dangerouslySetInnerHTML` ici, ni ailleurs dans le
// projet. Le texte riche n'est jamais du HTML : c'est une structure de
// données (Portable Text) que React parcourt et transforme en éléments.
// Rien de ce que la cliente écrit ne peut donc devenir une balise, encore
// moins un script.
//
// Les liens sont filtrés une SECONDE fois ici. Le schéma Sanity refuse
// déjà javascript: et data: à la saisie ; ce contrôle-ci protège des
// données arrivées autrement — import, migration, modification directe
// par l'API. Une validation de formulaire n'est pas une garantie.

import { PortableText } from '@portabletext/react'

/** Les seuls schémas d'URL autorisés dans un lien. */
const SCHEMAS_SURS = ['http:', 'https:', 'mailto:', 'tel:']

function lienSur(href) {
  if (typeof href !== 'string') return null
  // Une ancre interne est sûre par nature.
  if (href.startsWith('/') || href.startsWith('#')) return href
  try {
    return SCHEMAS_SURS.includes(new URL(href).protocol) ? href : null
  } catch {
    return null
  }
}

// Un saut de ligne saisi avec Maj+Entrée arrive sous la forme d'un « \n »
// dans le texte. Le rendu par défaut de Portable Text l'ignore : il faut
// le traduire explicitement en <br />, sinon une phrase volontairement
// coupée en deux se recolle.
function avecSautsDeLigne(enfants) {
  return (Array.isArray(enfants) ? enfants : [enfants]).flatMap((enfant, i) => {
    if (typeof enfant !== 'string' || !enfant.includes('\n')) return enfant
    return enfant.split('\n').flatMap((morceau, j, tout) =>
      j < tout.length - 1 ? [morceau, <br key={`b${i}-${j}`} />] : [morceau]
    )
  })
}

const composants = {
  block: {
    // Le style du site vient de globals.css : on ne pose aucune classe
    // décorative ici, seulement la structure.
    normal: ({ children }) => <p>{avecSautsDeLigne(children)}</p>,
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
  },
  marks: {
    // Les mots en gras du site sont roses : c'est la classe .accent,
    // déjà utilisée par le contenu écrit en dur.
    strong: ({ children }) => <strong className="accent">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    lien: ({ value, children }) => {
      const href = lienSur(value?.href)
      // Lien refusé : on garde le texte, on retire le lien. Le contenu
      // reste lisible, la page ne casse pas.
      if (!href) return <>{children}</>

      const externe = value?.nouvelOnglet && !href.startsWith('#')
      return (
        <a
          href={href}
          {...(externe ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {children}
        </a>
      )
    },
  },
}

/**
 * @param {{valeur: any[], className?: string}} props
 */
export default function TexteRiche({ valeur, className }) {
  // Champ vide : on ne rend rien plutôt qu'un paragraphe fantôme qui
  // laisserait un espace dans la mise en page.
  if (!Array.isArray(valeur) || valeur.length === 0) return null

  // Le conteneur n'existe que si une classe est demandée : sinon les
  // paragraphes se placent directement là où ils sont attendus.
  const contenu = <PortableText value={valeur} components={composants} />
  return className ? <div className={className}>{contenu}</div> : contenu
}

/**
 * Variante « une seule ligne » : rend les fragments SANS paragraphe
 * autour. Sert là où le design attend du texte à l'intérieur d'un
 * élément existant — une citation, un titre — et où un <p> imbriqué
 * casserait la mise en page.
 *
 * @param {{valeur: any[]}} props
 */
export function TexteRicheEnLigne({ valeur }) {
  if (!Array.isArray(valeur) || valeur.length === 0) return null
  return (
    <PortableText
      value={valeur}
      components={{ ...composants, block: { normal: ({ children }) => <>{avecSautsDeLigne(children)}</> } }}
    />
  )
}
