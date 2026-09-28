// page.js — la fiche d'un stage ou d'un événement.
//
// On y arrive depuis la frise de l'accueil. Tout ce qu'il faut pour
// décider, puis agir, sur un seul écran : quand, où, combien, s'il reste de
// la place — puis trois façons de s'inscrire, empilées en grands boutons.
//
// generateStaticParams pré-calcule une page par événement, passés compris :
// un lien partagé sur Facebook ne doit pas tomber sur une erreur le
// lendemain du stage. Une fiche passée le dit, et renvoie vers les
// prochains événements.

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { previewActif } from '../../../lib/preview'
import { getContenu, normaliserEvenement } from '../../../lib/contenu'
import { getEvenementParSlug, getSlugsEvenements } from '../../../lib/sanity/queries/index.js'
import { periodeLisible, statutAffiche } from '../../../lib/evenements/format.js'
import TexteRiche from '../../../components/TexteRiche'
import LienFormulaire from '../../../components/LienFormulaire'
import LienItineraire from '../../../components/LienItineraire'
import { Picto } from '../../../components/pictogrammes'

// Combien de temps cette page peut rester figée avant de redemander son
// contenu au CMS. Voir lib/revalidation.js : c'est ce qui permet de
// modifier le site depuis Sanity sans le reconstruire.
//
// Le nombre est écrit en clair parce que Next exige une valeur analysable
// statiquement — une constante importée est refusée au build. Il est donc
// répété dans chaque page, et `lib/revalidation.test.mjs` échoue si
// l'une d'elles s'écarte de la constante partagée.
export const revalidate = 60

// Même modèle que le blog : un nouvel événement apparaît après la
// reconstruction déclenchée par « Publier ». Toute autre adresse = 404.
export const dynamicParams = false

export async function generateStaticParams() {
  const slugs = (await getSlugsEvenements()) ?? []
  return slugs.filter((s) => s.slug).map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const brut = await getEvenementParSlug(slug)
  if (!brut) return { title: 'Événement introuvable' }
  const ev = normaliserEvenement(brut)
  const { seo } = await getContenu()
  const description = `${periodeLisible(ev.dateDebut, ev.dateFin)}${ev.lieu ? ` · ${ev.lieu}` : ''}${ev.prix ? ` · ${ev.prix}` : ''}`
  return {
    title: `${ev.titre} — ${seo.titre}`,
    description,
    alternates: seo.urlCanonique ? { canonical: `/evenements/${slug}` } : undefined,
    openGraph: {
      title: ev.titre,
      description,
      images: ev.image?.src ? [{ url: ev.image.src, alt: ev.image.alt }] : undefined,
    },
  }
}

/**
 * La fiche que Google lit pour afficher l'événement dans ses résultats.
 * JSON.stringify, puis échappement des caractères qui pourraient refermer
 * la balise — même précaution que pour les articles.
 */
function ficheEvenement(ev, infos) {
  const donnees = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: ev.titre,
    startDate: ev.dateDebut,
    ...(ev.dateFin ? { endDate: ev.dateFin } : {}),
    eventStatus: ev.statut === 'annule'
      ? 'https://schema.org/EventCancelled'
      : 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: ev.lieu || "M'GYM",
      address: (infos.adresse ?? '').split('\n').join(', '),
    },
    ...(ev.image?.src ? { image: ev.image.src } : {}),
    organizer: { '@type': 'Organization', name: "M'GYM — Bien-être & Santé" },
  }
  return JSON.stringify(donnees)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

export default async function FicheEvenement({ params }) {
  const { slug } = await params
  const enPreview = await previewActif()
  const brut = await getEvenementParSlug(slug, enPreview)
  if (!brut) notFound()

  const ev = normaliserEvenement(brut)
  const { infos } = await getContenu(enPreview)
  const statut = statutAffiche(ev.statut)
  const passe = new Date(ev.dateFin || ev.dateDebut) < new Date()
  const telBrut = (infos.telephone ?? '').replace(/[ .]/g, '')
  const lienInscription = ev.lienInscription || infos.lienStages
  const sujet = encodeURIComponent(`${ev.titre} — ${periodeLisible(ev.dateDebut, ev.dateFin)}`)

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ficheEvenement(ev, infos) }}
      />

      <article id="evenement" className="section-pad evenement-page">
        <div className="evenement-fiche">

          <Link href="/#evenements" className="blog-retour">← Tous les événements</Link>

          {passe && (
            <p className="evenement-alerte">
              Cet événement a eu lieu. <Link href="/#evenements" className="price-lien">Voir les prochains</Link>
            </p>
          )}

          <p className="section-label">{ev.activite?.titre ?? 'Stage & événement'}</p>
          <h1 className="section-title evenement-titre">{ev.titre}</h1>
          <p className={`frise-statut est-${statut.classe}`}>{statut.texte}</p>

          {/* Les informations pratiques, en liste de définitions : chaque
              ligne commence par son pictogramme et son intitulé. */}
          <dl className="evenement-infos">
            <div>
              <dt><Picto nom="horloge" taille={20} />Quand</dt>
              <dd>{periodeLisible(ev.dateDebut, ev.dateFin)}</dd>
            </div>
            <div>
              <dt><Picto nom="lieu" taille={20} />Où</dt>
              <dd>
                {ev.lieu || (infos.adresse ?? '').split('\n').join(', ')}
                {!ev.lieu && infos.positionCarte && (
                  <>
                    {' '}
                    <LienItineraire position={infos.positionCarte} className="price-lien">Itinéraire</LienItineraire>
                  </>
                )}
              </dd>
            </div>
            {ev.prix && (
              <div>
                <dt><Picto nom="prix" taille={20} />Tarif</dt>
                <dd>{ev.prix}</dd>
              </div>
            )}
            {ev.placesMax && (
              <div>
                <dt><Picto nom="places" taille={20} />Places</dt>
                <dd>{ev.placesMax} personnes au maximum</dd>
              </div>
            )}
          </dl>

          {ev.image && (
            <img className="evenement-image" src={ev.image.src} alt={ev.image.alt} fetchPriority="high" />
          )}

          <TexteRiche valeur={ev.description} className="blog-article-corps" />

          {!passe && ev.statut !== 'annule' && (
            <div className="contact-cta evenement-cta">
              <p className="contact-cta-title">
                {ev.statut === 'complet' ? <>C&apos;est <em>complet</em></> : <>Envie d&apos;y <em>participer</em>&nbsp;?</>}
              </p>
              <p className="contact-cta-sub">
                {ev.statut === 'complet'
                  ? 'Appelez-nous : une place peut se libérer, et nous tenons une liste d\'attente.'
                  : 'Inscrivez-vous en ligne, ou appelez-nous : nous répondons à toutes les questions.'}
              </p>
              <div className="cta-btns">
                {ev.statut !== 'complet' && lienInscription && (
                  <LienFormulaire lien={lienInscription} className="cta-btn-rose">S&apos;inscrire</LienFormulaire>
                )}
                {telBrut && <a href={`tel:${telBrut}`} className="cta-btn-rose">Appeler</a>}
                {infos.email && (
                  <a href={`mailto:${infos.email}?subject=${sujet}`} className="cta-btn-outline">Écrire</a>
                )}
              </div>
            </div>
          )}

          <p className="blog-article-pied">
            <Link href="/#evenements" className="price-lien">← Tous les événements</Link>
            {'  ·  '}
            <Link href="/" className="price-lien">Retour à l&apos;accueil</Link>
          </p>

        </div>
      </article>
    </main>
  )
}
