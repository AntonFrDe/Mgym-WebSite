# Restaurer une version précédente — M'GYM

> Phase 6 du plan. Que faire quand une publication s'avère être une erreur.
>
> **Rien n'est perdu.** Sanity conserve l'historique de chaque document :
> chaque publication crée une version, et les précédentes restent
> consultables et restaurables.

---

## En cas d'urgence — la version courte

1. Ouvrir le back-office, aller sur le document fautif.
2. Menu **⋯** en haut à droite → **History** (Historique).
3. Choisir la version d'avant l'erreur dans la liste de droite.
4. Cliquer **Restore** (Restaurer).
5. **Prévisualiser** pour vérifier.
6. **Publier**.

La restauration ne publie rien toute seule : elle remet l'ancien contenu
**en brouillon**. Rien ne change sur le site tant que vous n'avez pas
cliqué sur Publier. C'est voulu — une restauration se vérifie avant d'être
diffusée.

---

## La procédure détaillée

### 1. Identifier le problème

Notez **ce qui est faux** et **sur quel document**. Un titre de page vient
de « Textes du site », un cours de « Planning des cours », un stage de
« Événements ». Restaurer le mauvais document ferait perdre du travail
correct.

### 2. Ouvrir l'historique

Sur le document, le menu **⋯** en haut à droite propose **History**. Une
colonne apparaît à droite, avec la liste des versions, de la plus récente à
la plus ancienne, chacune datée et signée du nom de la personne.

### 3. Choisir la bonne version

Cliquez sur une version : le formulaire affiche son contenu, avec les
**différences surlignées**. Naviguez jusqu'à retrouver l'état d'avant
l'erreur.

> Prenez le temps ici. Une version trop ancienne ferait perdre des
> corrections faites entre-temps et sans rapport avec l'erreur.

### 4. Restaurer

Le bouton **Restore** ramène ce contenu dans le formulaire, **en
brouillon**. Le site public n'a pas bougé.

### 5. Prévisualiser

Ouvrez la prévisualisation et vérifiez que la page est bien redevenue
correcte. C'est l'étape qu'on saute quand on est pressé, et c'est celle qui
évite de publier deux erreurs de suite.

### 6. Publier

**Publier**. Le site se reconstruit ; comptez une à deux minutes.

### 7. Vérifier en production

Ouvrez `mgym.fr` dans une **fenêtre de navigation privée** — sinon votre
navigateur peut vous montrer une version en cache. Vérifiez que la
correction est bien en ligne.

---

## Ce que l'historique couvre, et ce qu'il ne couvre pas

| | Restaurable |
|---|---|
| Un texte modifié par erreur | ✅ |
| Un champ vidé | ✅ |
| Une image remplacée | ✅ (l'ancienne reste dans la médiathèque) |
| Un document **supprimé** | ✅ tant qu'il est dans la rétention |
| Une image supprimée de la médiathèque | ⚠️ vérifier avant de supprimer |
| Le code du site | ❌ ce n'est pas le rôle du CMS — voir git |

### Durée de rétention

Elle **dépend du forfait Sanity** et doit être vérifiée sur
`sanity.io/manage`, onglet du projet. Sur le forfait gratuit elle se compte
en jours, pas en années.

> **À faire avant la mise en production** — voir la section suivante.

---

## Vérification à faire avant la mise en production

Cette procédure a été **écrite** mais pas encore **éprouvée sur le projet
réel** : il n'existe pas encore de projet Sanity. Ces cinq points doivent
être exécutés une fois, sur le dataset de test, avant d'ouvrir le
back-office à la cliente.

```
□ 1. L'historique est actif sur le projet
     sanity.io/manage → projet → onglet Datasets

□ 2. La durée de rétention est connue et notée ici : ______ jours
     Si elle est trop courte pour l'usage, prévoir un export régulier
     (npx sanity dataset export) plutôt que de compter sur l'historique.

□ 3. Un compte « editor » voit bien le bouton History
     Se connecter avec le compte de la cliente, pas avec un compte admin.

□ 4. Une restauration réelle a été effectuée de bout en bout
     Modifier un champ, publier, modifier encore, publier, restaurer
     l'avant-dernière version, prévisualiser, publier, vérifier en ligne.

□ 5. Un document supprimé a été récupéré
     C'est le cas le plus stressant et le moins souvent testé.
```

> « Sanity possède un historique » n'est pas une preuve. Tant que ces cinq
> cases ne sont pas cochées, considérez que la restauration n'est pas
> garantie.

Le script `npm run verifier:historique` automatise les points 1, 2 et 4 dès
que les identifiants du projet sont renseignés.

---

## Le filet de sécurité au-delà de l'historique

L'historique protège d'une erreur de saisie. Il ne protège pas d'une perte
du projet Sanity. Pour cela, un export complet :

```bash
npm run sauvegarde
```

Il produit une archive contenant tous les documents **et** toutes les
images. À lancer avant toute opération risquée — migration, changement de
schéma en masse, suppression groupée.

Réimport :

```bash
npx sanity dataset import sauvegarde-2026-08-21.tar.gz production --replace
```

> `--replace` écrase le dataset. À n'utiliser qu'en connaissance de cause.
