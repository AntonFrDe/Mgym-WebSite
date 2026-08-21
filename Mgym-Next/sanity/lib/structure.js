// structure.js — le MENU du back-office.
//
// Sans ce fichier, Sanity affiche la liste brute des types, dans l'ordre
// du code : « activite », « creneau », « exception »… La cliente y verrait
// du vocabulaire de développeur.
//
// Ici, le menu est organisé par TÂCHE : ce qu'elle vient faire, pas ce que
// le code contient. Le planning en haut parce que c'est ce qui change le
// plus souvent ; les textes du site en bas parce qu'on n'y touche qu'une
// fois par an.

import { SINGLETONS } from '../schemaTypes/index.js'

export const structure = (S) =>
  S.list()
    .title('Administration du site')
    .items([
      // ── PLANNING ────────────────────────────────────────────
      S.listItem()
        .title('Planning des cours')
        .icon(() => '📅')
        .child(
          S.list()
            .title('Planning des cours')
            .items([
              S.listItem()
                .title('Créneaux réguliers')
                .icon(() => '🔁')
                .child(
                  S.documentTypeList('creneau')
                    .title('Créneaux réguliers')
                    .defaultOrdering([
                      { field: 'jour', direction: 'asc' },
                      { field: 'heureDebut', direction: 'asc' },
                    ])
                ),
              S.listItem()
                .title('Annulations & changements')
                .icon(() => '✏️')
                .child(
                  // Les plus récentes d'abord : on vient corriger la
                  // semaine en cours, pas relire l'an dernier.
                  S.documentTypeList('exception')
                    .title('Annulations & changements')
                    .defaultOrdering([{ field: 'date', direction: 'desc' }])
                ),
              S.listItem()
                .title('Périodes de fermeture')
                .icon(() => '🏖️')
                .child(
                  S.documentTypeList('fermeture')
                    .title('Périodes de fermeture')
                    .defaultOrdering([{ field: 'dateDebut', direction: 'desc' }])
                ),
            ])
        ),

      // ── ÉVÉNEMENTS ──────────────────────────────────────────
      S.listItem()
        .title('Événements & stages')
        .icon(() => '✨')
        .child(
          S.list()
            .title('Événements & stages')
            .items([
              S.listItem()
                .title('À venir')
                .child(
                  // Vue filtrée par défaut : les stages passés ne
                  // polluent pas la liste de travail.
                  S.documentList()
                    .title('Événements à venir')
                    .filter('_type == "evenement" && dateDebut >= now()')
                    .defaultOrdering([{ field: 'dateDebut', direction: 'asc' }])
                ),
              S.listItem()
                .title('Passés')
                .child(
                  S.documentList()
                    .title('Événements passés')
                    .filter('_type == "evenement" && dateDebut < now()')
                    .defaultOrdering([{ field: 'dateDebut', direction: 'desc' }])
                ),
              S.listItem()
                .title('Tous')
                .child(S.documentTypeList('evenement').title('Tous les événements')),
            ])
        ),

      // ── BLOG ────────────────────────────────────────────────
      S.listItem()
        .title('Articles du blog')
        .icon(() => '📝')
        .child(
          S.documentTypeList('article')
            .title('Articles du blog')
            .defaultOrdering([{ field: 'datePublication', direction: 'desc' }])
        ),

      // ── ACTIVITÉS ───────────────────────────────────────────
      S.listItem()
        .title('Les activités')
        .icon(() => '🏋️')
        .child(
          S.documentTypeList('activite')
            .title('Les activités')
            .defaultOrdering([{ field: 'ordreAffichage', direction: 'asc' }])
        ),

      S.divider(),

      // ── SINGLETONS ──────────────────────────────────────────
      // `documentListItem` plutôt que `documentTypeList` : on ouvre LE
      // document, sans passer par une liste d'un seul élément.
      S.listItem()
        .title('Textes du site')
        .icon(() => '📄')
        .child(S.document().schemaType('siteContent').documentId('siteContent')),

      S.listItem()
        .title('Infos pratiques')
        .icon(() => '📞')
        .child(S.document().schemaType('infosPratiques').documentId('infosPratiques')),

      S.listItem()
        .title('Référencement')
        .icon(() => '🔍')
        .child(S.document().schemaType('seoGlobal').documentId('seoGlobal')),
    ])

/**
 * Retire les actions dangereuses ou absurdes sur les documents uniques.
 *
 * Sans cela, la cliente peut « Dupliquer » les textes du site — et se
 * retrouver avec deux documents dont le site n'en lit qu'un, sans
 * comprendre pourquoi ses modifications n'apparaissent pas. Ou pire :
 * les « Supprimer ».
 */
export const actionsDocument = (actionsExistantes, contexte) => {
  if (!SINGLETONS.includes(contexte.schemaType)) return actionsExistantes

  return actionsExistantes.filter(
    ({ action }) => !['unpublish', 'delete', 'duplicate'].includes(action)
  )
}

/**
 * Empêche la création d'un second exemplaire d'un document unique depuis
 * le bouton « + » global.
 */
export const modelesDocument = (modeles, contexte) =>
  modeles.filter((m) => !SINGLETONS.includes(m.templateId))
