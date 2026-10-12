// EnteteActivites.js — le titre du bloc « Activités ».
//
// POURQUOI CE FICHIER EXISTE
// Il est isolé pour garder CarrouselActivites.js lisible : l'en-tête
// — étiquette, titre, trait, chapô — est indépendante du carrousel.
//
// La DERNIÈRE PHRASE change selon le contexte, parce qu'elle explique comment
// manipuler ce qui suit (faire défiler des cartes, par exemple). Elle est
// donc passée en paramètre, et reste dans le code : c'est une instruction
// d'usage liée au dessin, pas du contenu.

export default function EnteteActivites({ site, instruction }) {
  return (
    <div className="acts-header apparition">
      <p className="section-label">{site.activitesEtiquette}</p>
      <h2 className="section-title">
        {site.activitesTitre} <em>{site.activitesTitreItalique}</em>
      </h2>
      <div className="divider" />
      <p className="lead">
        {site.activitesChapo}{instruction ? ` ${instruction}` : ''}
      </p>
    </div>
  )
}
