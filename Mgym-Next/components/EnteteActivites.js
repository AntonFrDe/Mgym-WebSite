// EnteteActivites.js — le titre du bloc « Activités », commun aux deux
// affichages.
//
// POURQUOI CE FICHIER EXISTE
// SentierActivites.js et CarrouselActivites.js sont deux présentations des
// mêmes données. Leur en-tête — étiquette, titre, trait, chapô — était
// recopiée à l'identique dans les deux : corriger une faute demandait de
// penser à le faire deux fois, et une seule des deux versions finissait
// corrigée.
//
// Seule la DERNIÈRE PHRASE change d'un affichage à l'autre, parce qu'elle
// explique comment manipuler ce qui suit (cliquer sur une étape / faire
// défiler des cartes). Elle est donc passée en paramètre, et reste dans le
// code : c'est une instruction d'usage liée au dessin, pas du contenu.

export default function EnteteActivites({ site, instruction }) {
  return (
    <div className="acts-header apparition">
      <p className="section-label">{site.activitesEtiquette}</p>
      <h2 className="section-title">
        {site.activitesTitre} <em>{site.activitesTitreItalique}</em>
      </h2>
      <div className="divider" />
      <p className="lead">
        {site.activitesChapo} {instruction}
      </p>
    </div>
  )
}
