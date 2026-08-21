// page.js — la liste des articles du blog.
//
// POURQUOI CETTE PAGE EXISTE
// Le blog est la seule raison commerciale d'exister d'un contenu régulier :
// il fait entrer des visiteurs par les moteurs de recherche. Le sitemap
// déclarait déjà des adresses /blog/… ; sans ces pages, il pointait vers du
// vide.
//
// Le site reste une page unique pour l'essentiel : le blog est la SEULE
// route supplémentaire, et elle réutilise entièrement le style existant.

import Link from 'next/link'
import { previewActif } from '../../lib/preview'
import { getContenu } from '../../lib/contenu'
import { getArticles } from '../../lib/sanity/queries/index.js'
import { dateLisible } from '../../lib/planning/grille.js'

export async function generateMetadata() {
  const { seo } = await getContenu()
  return {
    title: `Le blog — ${seo.titre}`,
    description:
      "Conseils bien-être, actualités des cours et vie de l'association " +
      "M'GYM à Mirepoix-sur-Tarn.",
    alternates: seo.urlCanonique ? { canonical: '/blog' } : undefined,
  }
}

export default async function Blog() {
  const enPreview = await previewActif()
  const articles = (await getArticles(enPreview)) ?? []

  return (
    <main>
      <section id="blog" className="section-pad blog-page">
        <div className="section-max">

          <div className="blog-entete apparition">
            <p className="section-label">Le blog</p>
            <h2 className="section-title">
              Conseils &amp; <em>actualités</em>
            </h2>
            <div className="divider" />
          </div>

          {articles.length === 0 ? (
            // État vide digne : une phrase, un retour. Pas une page cassée.
            <p className="blog-vide apparition">
              Les premiers articles arriveront bientôt.
              <br />
              <Link href="/" className="price-lien">Revenir à l&apos;accueil</Link>
            </p>
          ) : (
            <div className="blog-grille">
              {articles.map((article, i) => (
                <article
                  key={article._id}
                  className={`blog-carte apparition retard-${Math.min(i + 1, 6)}`}
                >
                  <Link href={`/blog/${article.slug}`} className="blog-carte-lien">
                    {article.image && (
                      <div className="blog-carte-media">
                        <img src={article.image.src} alt={article.image.alt} loading="lazy" />
                      </div>
                    )}
                    <div className="blog-carte-corps">
                      <p className="blog-carte-date">{dateLisible(article.datePublication)}</p>
                      <h3 className="blog-carte-titre">{article.titre}</h3>
                      <p className="blog-carte-extrait">{article.extrait}</p>
                      <span className="etape-lien">Lire l&apos;article →</span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}

        </div>
      </section>
    </main>
  )
}
