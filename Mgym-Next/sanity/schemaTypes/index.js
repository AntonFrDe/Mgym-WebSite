// index.js — la liste des modèles de contenu du Studio.
//
// Chaque modèle vit dans son propre fichier, et c'est ici qu'on les
// rassemble. Ajouter un modèle = créer le fichier, puis l'ajouter à ce
// tableau. Rien d'autre.
//
// L'ordre de ce tableau n'a AUCUNE importance : le menu du Studio est
// construit séparément dans sanity/lib/structure.js, pour pouvoir le
// présenter dans un ordre qui parle à la cliente plutôt qu'au code.

// Briques réutilisées par plusieurs modèles.
import { lien } from './objets/lien.js'
import { texteRiche, texteSimple } from './objets/texteRiche.js'
import { imageEditoriale } from './objets/imageEditoriale.js'
import { tarifSimple, tarifSaison, statistique, reseauSocial } from './objets/tarifs.js'

// Documents : ce que la cliente crée et modifie.
import { activite } from './activite.js'
import { creneau } from './creneau.js'
import { exception } from './exception.js'
import { fermeture } from './fermeture.js'
import { evenement } from './evenement.js'
import { article } from './article.js'
import { siteContent } from './siteContent.js'
import { infosPratiques } from './infosPratiques.js'
import { seoGlobal } from './seoGlobal.js'

export const schemaTypes = [
  // objets
  lien, texteRiche, texteSimple, imageEditoriale,
  tarifSimple, tarifSaison, statistique, reseauSocial,
  // documents
  activite, creneau, exception, fermeture, evenement, article,
  siteContent, infosPratiques, seoGlobal,
]

// Les documents dont il n'existe QU'UN exemplaire. Utilisé par la
// structure du menu pour les rendre non supprimables et non duplicables.
export const SINGLETONS = ['siteContent', 'infosPratiques', 'seoGlobal']
