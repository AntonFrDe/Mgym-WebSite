// page.js — un article du blog.
//
// generateStaticParams pré-calcule une page par article au moment du build :
// le visiteur reçoit du HTML déjà prêt, et le moteur de recherche aussi.

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { previewActif } from '../../../lib/preview'
import { getContenu } from '../../../lib/contenu'
import { getArticleParSlug, getSlugsArticles } from '../../../lib/sanity/queries/index.js'
import { dateLisible } from '../../../lib/planning/grille.js'
import TexteRiche from '../../../components/TexteRiche'

// Combien de temps cette page peut rester figée avant de redemander son
// contenu au CMS. Voir lib/revalidation.js : c'est ce qui permet de
// modifier le site depuis Sanity sans le reconstruire.
//
// Le nombre est écrit en clair parce que Next exige une valeur analysable
// statiquement — une constante importée est refusée au build. Il est donc
// répété dans les trois pages, et `lib/revalidation.test.mjs` échoue si
// l'une d'elles s'écarte de la constante partagée.
export const revalidate = 60

// Seules les adresses rendues par generateStaticParams existent : toute
// autre renvoie un 404, sans passer par le serveur. C'est exactement le
// modèle de publication du projet — un nouvel article apparaît après la
// reconstruction déclenchée par « Publier », pas avant.
//
// C'est aussi ce qui permet à la copie hors-ligne de se construire : sans
// cette ligne, Next refuse d'exporter une route dynamique.
export const dynamicParams = false

/** Une page par article, calculée au build. */
export async function generateStaticParams() {
  const slugs = (await getSlugsArticles()) ?? []
  return slugs.filter((s) => s.slug).map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const article = await getArticleParSlug(slug)
  if (!article) return { title: 'Article introuvable' }

  const { seo } = await getContenu()
  const image = article.image?.src
    ? [{ url: article.image.src, alt: article.image.alt }]
    : undefined

  return {
    // seoTitre est facultatif : sans lui, le titre de l'article fait l'affaire.
    title: `${article.seoTitre || article.titre} — ${seo.titre}`,
    description: article.seoDescription || article.extrait,
    alternates: seo.urlCanonique ? { canonical: `/blog/${slug}` } : undefined,
    openGraph: {
      type: 'article',
      title: article.seoTitre || article.titre,
      description: article.seoDescription || article.extrait,
      publishedTime: article.datePublication,
      authors: article.auteur ? [article.auteur] : undefined,
      images: image,
    },
  }
}

/**
 * La fiche que Google lit pour reconnaître un article. Même précaution que
 * pour les données structurées de l'accueil : JSON.stringify, puis
 * échappement des caractères qui pourraient refermer la balise.
 */
function ficheArticle(article, seo) {
  const donnees = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.titre,
    description: article.extrait,
    datePublished: article.datePublication,
    ...(article.auteur ? { author: { '@type': 'Person', name: article.auteur } } : {}),
    ...(article.image?.src ? { image: article.image.src } : {}),
    publisher: { '@type': 'Organization', name: "M'GYM — Bien-être & Santé" },
    ...(seo.urlCanonique
      ? { mainEntityOfPage: `${seo.urlCanonique}/blog/${article.slug}` }
      : {}),
  }
  return JSON.stringify(donnees)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

export default async function Article({ params }) {
  const { slug } = await params
  const enPreview = await previewActif()
  const article = await getArticleParSlug(slug, enPreview)

  // Article supprimé ou adresse inventée : page 404 propre, jamais une
  // erreur technique affichée au visiteur.
  if (!article) notFound()

  const { seo } = await getContenu(enPreview)

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ficheArticle(article, seo) }}
      />

      <article className="section-pad blog-page">
        <div className="blog-article">

          <div className="blog-entete apparition">
            <Link href="/blog" className="blog-retour">← Tous les articles</Link>
            <h1 className="section-title blog-article-titre">{article.titre}</h1>
            <p className="blog-article-meta">
              {dateLisible(article.datePublication)}
              {article.auteur && ` · ${article.auteur}`}
            </p>
            <div className="divider" />
          </div>

          {article.image && (
            <img
              className="blog-article-image apparition"
              src={article.image.src}
              alt={article.image.alt}
              fetchPriority="high"
            />
          )}

          <TexteRiche valeur={article.corps} className="blog-article-corps apparition" />

          <p className="blog-article-pied apparition">
            <Link href="/blog" className="price-lien">← Tous les articles</Link>
            {'  ·  '}
            <Link href="/" className="price-lien">Retour à l&apos;accueil</Link>
          </p>

        </div>
      </article>
    </main>
  )
}
