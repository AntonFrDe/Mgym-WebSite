// LienFormulaire.js — le bouton qui mène au formulaire d'inscription.
//
// POURQUOI UN COMPOSANT POUR UN SIMPLE LIEN
// Ce bouton apparaît à deux endroits (Tarifs et Contact) et doit dire trois
// choses au visiteur AVANT qu'il ne clique :
//   1. ce qui va se passer — un formulaire s'ouvre ;
//   2. qu'il quitte le site — la flèche ↗ le signale à l'œil, et le texte
//      masqué le dit aux lecteurs d'écran, qui ne « voient » pas l'icône ;
//   3. que la page actuelle ne disparaît pas — le formulaire s'ouvre dans
//      un nouvel onglet.
// L'écrire deux fois, c'était se condamner à ne corriger qu'une des deux.
//
// Le public du site est souvent senior : un bouton qui emmène ailleurs sans
// prévenir est la première cause d'abandon. D'où l'insistance.



/**
 * @param {{lien?: string, className?: string, children: any}} props
 *   `lien` vient d'« Infos pratiques ». Absent, le bouton renvoie vers la
 *   section Contact plutôt que vers le vide.
 */
export default function LienFormulaire({ lien, className = 'btn-primary', children }) {
  const destination = lien || '#contact'
  const externe = Boolean(lien)

  return (
    <a
      href={destination}
      className={className}
      {...(externe ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
      {/* aria-hidden sur l'icône : elle double une information déjà donnée
          par le texte masqué juste après, l'entendre deux fois serait
          pénible. */}
      <svg
        className="icone-externe"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
      >
        <path d="M4.5 1.5h6v6M10.5 1.5L5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 8.5v2h-7.5V3h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="visuellement-masque">
        {' '}(formulaire Google, s&apos;ouvre dans un nouvel onglet)
      </span>
    </a>
  )
}
