// page.js — LA page d'accueil (la route « / »).
//
// Elle n'écrit pas de HTML : elle récupère le contenu une seule fois et le
// distribue aux composants, qui restent de simples afficheurs.
//
// POURQUOI LE CONTENU EST RÉCUPÉRÉ ICI, ET PAS DANS CHAQUE COMPOSANT
// Une seule requête pour toute la page plutôt que douze. Et surtout : le
// contenu est disponible dès le PREMIER rendu. C'est ce qui protège les
// animations — un composant qui recevrait ses données après coup se
// remonterait, et les étapes du sentier repasseraient invisibles.

import { previewActif } from '../lib/preview'
import { getContenu } from '../lib/contenu'
import { getArticles } from '../lib/sanity/queries/index.js'
import { repartirActivites } from '../lib/contenu/rubriques.js'
import { periodeLisible } from '../lib/evenements/format.js'

import Hero               from '../components/Hero'
import Manifesto          from '../components/Manifesto'
import About              from '../components/About'
// Les deux versions du site utilisent les mêmes données d'activités.
// `MGYM_VARIANT=sentier` permet de générer la version verticale.
import CarrouselActivites from '../components/CarrouselActivites'
import SentierActivites   from '../components/SentierActivites'
import PlusActivites      from '../components/PlusActivites'
import Coach              from '../components/Coach'
import Temoignages        from '../components/Temoignages'
import Pricing            from '../components/Pricing'
import Planning           from '../components/Planning'
import Evenements, { lienEvenement } from '../components/Evenements'
import BlogApercu         from '../components/BlogApercu'
import Reseaux            from '../components/Reseaux'
import Contact            from '../components/Contact'
import Footer             from '../components/Footer'
import DonneesStructurees from '../components/DonneesStructurees'

// Combien de temps cette page peut rester figée avant de redemander son
// contenu au CMS. Voir lib/revalidation.js : c'est ce qui permet de
// modifier le site depuis Sanity sans le reconstruire.
//
// Le nombre est écrit en clair parce que Next exige une valeur analysable
// statiquement — une constante importée est refusée au build. Il est donc
// répété dans les trois pages, et `lib/revalidation.test.mjs` échoue si
// l'une d'elles s'écarte de la constante partagée.
export const revalidate = 60

const isSentier = process.env.MGYM_VARIANT === 'sentier'
const ActivitesSection = isSentier ? SentierActivites : CarrouselActivites

export default async function Home() {
  const enPreview = await previewActif()
  const { site, infos, seo, activites, evenements } = await getContenu(enPreview)
  // La copie hors-ligne n'a pas de blog (voir export-statique.mjs) : pas
  // d'aperçu qui mènerait à des pages absentes.
  const articles = process.env.MGYM_EXPORT === '1' ? [] : await getArticles(enPreview)
  // Les cours vont dans le carrousel ; les deux offres (ateliers,
  // prestations sur mesure) dans les onglets « Plus d'activités ».
  const { cours, ateliers } = repartirActivites(activites)
  // Les prochains ateliers : les événements rattachés à l'activité
  // « Ateliers thématiques » dans le back-office. L'onglet les affiche
  // directement, au lieu d'un simple « voir les dates ».
  const prochainsAteliers = ateliers
    ? evenements
        .filter((ev) => ev.activite?._id === ateliers._id)
        .slice(0, 3)
        .map((ev) => ({
          _id: ev._id,
          titre: ev.titre,
          quand: periodeLisible(ev.dateDebut, ev.dateFin),
          href: lienEvenement(ev, seo.urlCanonique),
        }))
    : []

  return (
    <main>
      {/* Invisible : la fiche que Google lit pour afficher l'adresse et
          le téléphone directement dans ses résultats. */}
      <DonneesStructurees infos={infos} seo={seo} activites={activites} />

      <Hero site={site} />
      <Manifesto site={site} />
      <About site={site} />
      <ActivitesSection site={site} activites={cours} />
      <PlusActivites site={site} infos={infos} ateliers={ateliers} prochainsAteliers={prochainsAteliers} />
      <Coach site={site} />
      <Temoignages site={site} />
      <Pricing site={site} infos={infos} />
      <Planning site={site} enPreview={enPreview} />
      <Evenements site={site} evenements={evenements} urlSite={seo.urlCanonique} />
      <BlogApercu articles={articles} />
      <Reseaux site={site} infos={infos} />
      <Contact site={site} infos={infos} />
      <Footer site={site} infos={infos} />
    </main>
  )
}
