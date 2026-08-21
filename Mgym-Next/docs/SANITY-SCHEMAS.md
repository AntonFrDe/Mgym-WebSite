# Modèles de contenu Sanity — M'GYM

> Phase 2 et 3 du plan. Ce document décrit **ce que la cliente voit** dans le
> back-office, et **pourquoi** chaque contrainte existe.
> Vérification : `npm run schemas:check`.

## Vue d'ensemble

**17 types déclarés · 9 documents · 3 singletons.**

| Type | Nature | Ce que c'est pour la cliente |
|---|---|---|
| `activite` | liste | Les activités proposées (Yin Yoga, Pilates…) |
| `creneau` | liste | Un cours qui revient chaque semaine |
| `exception` | liste | Une annulation ou un changement, sur une date |
| `fermeture` | liste | Une période de vacances |
| `evenement` | liste | Un stage, un atelier |
| `article` | liste | Un article de blog |
| `siteContent` | **unique** | Tous les textes du site |
| `infosPratiques` | **unique** | Adresse, téléphone, réseaux |
| `seoGlobal` | **unique** | Ce que Google et Facebook affichent |

Types techniques réutilisés, jamais créés directement : `lien`, `texteRiche`,
`texteSimple`, `imageEditoriale`, `tarifSimple`, `tarifSaison`, `statistique`,
`reseauSocial`.

---

## Les trois principes appliqués partout

### 1. Chaque champ porte sa documentation

Toute description est en français et dit **quoi mettre**, pas ce que le champ
est. `npm run schemas:check` échoue si un champ éditorial n'en a pas.

> « Format paysage de préférence, 1200 px de large minimum. Elle est affichée
> en rond dans le sentier et en bandeau dans les cartes : placez le point de
> recadrage sur le sujet principal. »

### 2. Chaque message d'erreur dit comment corriger

Jamais « Required ». Toujours la raison et la limite :

> « L'accroche est obligatoire et limitée à 80 caractères : au-delà, elle
> passe sur deux lignes et déséquilibre la carte. »

> « Le titre est obligatoire et limité à 60 caractères : au-delà, Google le
> coupe. »

### 3. Chaque liste est lisible d'un coup d'œil

Aucun `preview` ne renvoie « Untitled ». Un créneau s'affiche
**« Pilates — Mardi 18h30 »**, une exception **« 21/02/2026 — Yoga »**, une
activité désactivée porte la mention **MASQUÉE**.

---

## Ce que la cliente ne peut pas faire

C'est la partie la plus importante du modèle.

| Interdit | Comment |
|---|---|
| Changer une couleur, une police, une taille | Aucun champ ne les expose |
| Coller du HTML | Portable Text n'accepte aucun bloc HTML |
| Aligner ou colorer du texte | `styles` limité à Paragraphe / Titre / Sous-titre |
| Poser un lien `javascript:` ou `data:` | `Rule.uri({scheme: ['http','https','mailto','tel']})` |
| Téléverser un SVG | `accept: 'image/jpeg,image/png,image/webp,image/avif'` |
| Publier une image sans description | `alt` obligatoire, minimum 5 caractères |
| Supprimer un singleton | Actions retirées dans la structure du menu (Phase 4) |
| Réordonner les sections de la page | L'ordre vit dans `app/page.js`, pas dans le CMS |

Le SVG est exclu **volontairement** : c'est un format qui peut contenir du
script. Une image qui exécute du code n'est plus une image.

---

## Le texte riche, en deux versions

| Format | Autorise | Employé pour |
|---|---|---|
| `texteRiche` | gras, italique, listes, liens, H2, H3 | Articles, description d'événement |
| `texteSimple` | gras, italique, liens | Paragraphes de la page d'accueil |

`texteSimple` existe parce qu'un titre de niveau 2 au milieu du paragraphe
« À propos » casserait la mise en page, qui n'en prévoit pas.

---

## Le planning : trois modèles, pas un

C'est le point le plus délicat du modèle de données.

```
creneau     LA RÈGLE          « le Pilates a lieu tous les lundis à 19h15 »
exception   L'EXCEPTION       « sauf le 21 février, où il est annulé »
fermeture   LA PARENTHÈSE     « et rien du 20 décembre au 3 janvier »
```

Saisir une annulation **ne touche pas** le créneau : la semaine suivante,
tout reprend. Pour une semaine entière de vacances, une seule `fermeture`
remplace dix `exception`.

### L'heure est une heure française, jamais convertie

`heureDebut` est une chaîne, `"19:15"`, et non une date. C'est délibéré.

Stocker `2026-01-15T19:15:00Z` obligerait à reconvertir à l'affichage, et un
cours de 18h30 deviendrait 17h30 au passage à l'heure d'hiver. Une chaîne
`"19:15"` signifie 19h15 à Mirepoix, en janvier comme en juillet. Le moteur
de planning (Phase 5) ne fait aucune conversion de fuseau.

La validation impose le format : `/^([01]\d|2[0-3]):[0-5]\d$/`, avec le
message « Écrivez l'heure au format HH:MM, par exemple 19:15. N'utilisez ni
« h » ni virgule. »

---

## Deux notions à ne pas confondre

Sur un événement, deux choses ressemblent à un statut :

| | Où | Ce que ça décide |
|---|---|---|
| **Brouillon / Publié** | bouton en bas du Studio | Le contenu est-il visible sur le site |
| **Statut de l'événement** | champ `statut` | Information affichée : ouvert, complet, annulé |

Un stage **publié et complet** reste visible. Les confondre ferait disparaître
du site un stage simplement parce qu'il ne reste plus de place. Le champ porte
cet avertissement dans sa propre description.

---

## Écart assumé par rapport au plan

Le plan prévoit un champ `icone` sur `activite`. **Il n'a pas été créé.**

Le site n'a aucun emplacement pour une icône d'activité : ni le carrousel, ni
le sentier n'en affichent. Le créer aurait donné à la cliente un champ à
remplir pour rien, et la question 1 de l'audit final du plan — « y a-t-il un
champ défini jamais utilisé ? » — aurait répondu oui.

À créer le jour où le design en prévoit un.

---

## Identité technique

Aucun modèle n'utilise le titre comme identité. Chaque document a son `_id`
Sanity, stable quand la cliente corrige une faute dans un nom.

C'est ce qui empêche le retour du bug d'animation documenté : avec
`key={act.name}`, renommer « Yogilates » démontait le composant React et
l'étape disparaissait. Avec `key={act._id}`, elle ne bouge pas.
