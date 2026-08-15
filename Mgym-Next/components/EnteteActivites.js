// EnteteActivites.js — le titre du bloc « Activités », commun aux deux
// affichages.
//
// POURQUOI CE FICHIER EXISTE
// SentierActivites.js et CarrouselActivites.js sont deux présentations des
// mêmes données (activitesData.js). Leur en-tête — étiquette, titre, trait,
// chapô — était recopiée à l'identique dans les deux : corriger une faute
// dans le titre demandait de penser à le faire deux fois, et une seule des
// deux versions finissait corrigée.
//
// Seule la DERNIÈRE PHRASE change d'un affichage à l'autre, parce qu'elle
// explique comment manipuler ce qui suit (cliquer sur une étape / faire
// défiler des cartes). Elle est donc passée en paramètre.

export default function EnteteActivites({ instruction }) {
  return (
    <div className="acts-header apparition">
      <p className="section-label">Nos pratiques</p>
      <h2 className="section-title">Formes &amp; <em>Bien-être</em></h2>
      <div className="divider" />
      <p className="lead">
        Renforcez votre corps, libérez les tensions et retrouvez une énergie
        durable. {instruction}
      </p>
    </div>
  )
}
