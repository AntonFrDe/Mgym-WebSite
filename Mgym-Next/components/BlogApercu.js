// BlogApercu.js — les trois derniers articles, sur la page d'accueil.
//
// Le blog n'était atteignable que par le pied de page : personne ne le
// trouvait. Il a maintenant son lien dans le menu ET cet aperçu. Sans
// article publié, la section n'existe pas — pas de « bientôt » qui dure.
// Les cartes reprennent exactement celles de la page /blog.

import Link from 'next/link'
import { dateLisible } from '../lib/planning/grille.js'
import { resume } from '../lib/resume.js'

const NOMBRE = 3

export default function BlogApercu({ articles = [] }) {
  const derniers = articles.slice(0, NOMBRE)
  if (derniers.length === 0) return null

  return (
    <section id="blog-apercu" className="section-pad">
      <div className="section-max">
        <div className="blog-entete apparition">
          <p className="section-label">Le blog</p>
          <h2 className="section-title">Conseils &amp; <em>actualités</em></h2>
          <div className="divider" />
        </div>
        <div className="blog-grille">
          {derniers.map((article, i) => (
            <article key={article._id} className={`blog-carte apparition retard-${i + 1}`}>
              <Link href={`/blog/${article.slug}`} className="blog-carte-lien">
                {article.image && (
                  <div className="blog-carte-media">
                    <img src={article.image.src} alt={article.image.alt} loading="lazy" />
                  </div>
                )}
                <div className="blog-carte-corps">
                  <p className="blog-carte-date">{dateLisible(article.datePublication)}</p>
                  <h3 className="blog-carte-titre">{article.titre}</h3>
                  <p className="blog-carte-extrait">{article.extrait || resume(article.debut)}</p>
                  <span className="etape-lien">Lire l&apos;article →</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
        <p className="blog-apercu-tous">
          <Link href="/blog" className="btn-outline">Tous les articles</Link>
        </p>
      </div>
    </section>
  )
}
