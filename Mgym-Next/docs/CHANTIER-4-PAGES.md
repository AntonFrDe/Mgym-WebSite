# Chantier « 4 pages » — d'après le mail de la cliente du 8 octobre 2026

> Source : `Modifications site Mgym.eml` (racine du dépôt), 6 photos jointes.
> Modèle de référence cité par la cliente : <https://latelierpilates.com/latelier/>
> — un menu à sous-menus, des pages qui se suivent, des compléments derrière
> des onglets.
>
> Pour chaque lot : **Demande** = ce que la cliente a écrit ; **Ajouts** = ce
> qu'il faut en plus pour que ce soit complet, sûr et utilisable ; **Fini
> quand** = le critère de réception.

---

## Méthode de découpage

Les lots (niveau 1) sont découpés **au moment de les réaliser**, pas avant :
le code aura changé entre-temps.

| Niveau | Exemple | Qui |
|---|---|---|
| N1 — lot | `L4` Page Activités | Opus planifie |
| N2 — sous-tâche, une fonction ou un écran | `L4.2` Modèle « thème » dans Sanity | Opus découpe |
| N3 — tâche atomique | `L4.2.3` Ajouter le champ `pratiques` au schéma `theme` | **Haiku 4.5** exécute, Opus relit |

Une tâche N3 confiée à Haiku tient sur **un fichier**, environ 50 lignes de diff au plus.
Elle donne l'emplacement exact, le résultat attendu, les règles de
`CLAUDE.md` qui s'appliquent, et **une commande de vérification**
(`node --test …`, `npm run build`, une mesure en navigateur). Opus relit chaque diff
et relance les tests avant la tâche suivante.

**Ne descendent jamais chez Haiku**, faute d'un critère simple de réussite :
- le modèle de données et la migration du contenu Sanity ;
- les routes et la redirection des anciennes ancres ;
- la CSP et la sécurité ;
- la conception du menu accessible ;
- les décisions de design.

> « Haiku 5.5 » n'existe pas : le Haiku le plus récent est **Haiku 4.5**
> (`claude-haiku-4-5`), c'est lui qui sera utilisé.

---

## Décisions à prendre AVANT de commencer

| # | Question | Recommandation |
|---|---|---|
| D1 | Supprimer la copie hors-ligne (`build-standalone.js`, `export-statique.mjs`, `localiser-images.mjs`) et la variante « sentier » ? | **Oui.** Elles reproduisent le site d'une seule page en JS vanilla ; en multi-pages, il faudrait tout réécrire deux fois. |
| D2 | « Réseaux » dans le menu : page à part, ou section en bas de l'accueil ? | **Section** (`/#reseaux`) : deux liens ne remplissent pas une page. |
| D3 | La citation sur bandeau sombre (`Manifesto`) : la cliente ne la cite pas. On la garde ? | À demander. |
| D4 | Carte du « lieu des cours » : carte OpenStreetMap intégrée, ou image fixe + bouton « Itinéraire » ? | **Carte intégrée** : la CSP s'ouvre au seul domaine `openstreetmap.org`. Le bouton « Itinéraire » existe déjà (`LienItineraire.js`). |
| D5 | Réservation des ateliers : formulaire Google, ou formulaire sur le site ? | **Google Form**, créé par la cliente sur son compte : zéro code, et elle reçoit les réponses. Le site pré-remplit l'atelier choisi. |
| D6 | `emma@mgym.fr` : partout, ou seulement sur la page Sur mesure ? (Sanity contient `contact@mgym.fr`) | À demander. **Vérifier que la boîte existe** chez OVH avant de l'afficher. |
| D7 | Les photos reçues font 480 à 640 px et semblent retouchées ou générées par IA. | Demander les **originaux en haute définition** (≥ 1920 px pour le haut de page, ≥ 1200 px ailleurs). Si ce sont de vraies adhérentes : leur accord écrit (droit à l'image). Voir ADR-006. |

---

## L0 — Préparer le chantier

**Ajouts** (rien dans le mail, mais indispensable) :
- sauvegarde du contenu avant toute migration : `npm run sauvegarde` ;
- une branche `refonte-4-pages` depuis `main`, **une seule fusion à la fin**
  (chaque mise en production coûte 15 crédits Netlify sur 300) ;
- appliquer D1 : retirer le code de la copie hors-ligne, ses scripts `npm` et
  ses mentions dans `CLAUDE.md`.

**Fini quand** l'archive de sauvegarde est rouverte et comptée, et que `npm run
verifier` passe sur la branche sans le code retiré.

---

## L1 — Passer d'une page unique à plusieurs pages

**Demande** : « on peut fonctionner avec 4 pages (accueil, activités, atelier
et sur mesure) ».

**Ajouts :**
- routes : `/` Accueil · `/activites` · `/ateliers-stages` · `/sur-mesure` ·
  `/blog` (existe) · `/evenements/[slug]` (existe, rattaché aux ateliers) ·
  `/mentions-legales` (nouvelle, voir L7) ;
- `Nav`, `Contact` et `Footer` passent dans `app/layout.js`, communs à toutes
  les pages ;
- chaque page : `revalidate = 60` (le test `revalidation.test.mjs` doit
  connaître la nouvelle liste), son titre, sa description, son adresse
  canonique et son entrée dans `sitemap.js` ;
- **les anciennes adresses ne cassent pas.** Les liens `/#tarifs`,
  `/#planning`, `/#evenements`, `#bespoke`, `#outdoor`, `#ateliers` circulent
  (Facebook, e-mails, fiche Google) et sont enregistrés dans Sanity
  (`activite.lienInterne`). Le serveur ne reçoit jamais la partie après `#` :
  un petit script sur l'accueil renvoie vers la bonne page, avec une table de
  correspondance testée ;
- Aperçu du Studio (`sanity/lib/presentation.js`) : chaque document s'ouvre
  sur sa page.

**Fini quand** les 4 pages répondent 200, que les 6 anciennes ancres arrivent
au bon endroit, que le sitemap liste les pages et que l'Aperçu s'ouvre sur la
bonne page.

---

## L2 — Le menu d'en-tête

**Demande :** 4 entrées et le bouton CONTACT :
- **Accueil** ▾ : Notre histoire · Le lieu des cours · Votre coach · Témoignages
- **Activités** ▾ :
  - Cours réguliers : Les pratiques · Planning · Tarifs · Inscription
  - Ateliers & Stages
  - Sur mesure
- **Réseaux**
- **Blog**

**Ajouts :**
- **pas de troisième niveau en cascade** : « Cours réguliers » devient un
  titre de groupe dans le menu Activités, avec ses 4 liens dessous. Un
  sous-sous-menu au survol se manque à la souris et ne s'ouvre pas au doigt ;
  le public est senior ;
- menus ouverts **au clic** (pas seulement au survol), touche Échap pour
  fermer, flèches au clavier, `aria-expanded`. La page en cours est marquée
  (`aria-current`) ;
- sur téléphone : accordéons dans le menu hamburger, cibles de 44 px ;
- « Inscription » ouvre le formulaire Google dans un nouvel onglet, avec une
  flèche ↗ qui l'annonce ;
- « Réseaux » mène à `/#reseaux` (D2), « Contact » à la section Contact de la
  page en cours ;
- pied de page : le même menu allégé, plus « Mentions légales ».

**Fini quand** le menu marche à la souris, au clavier seul et au doigt, à 320,
375, 768 et 1280 px, sans chevauchement de texte (le défaut iPhone signalé
dans `FIX site.txt`).

---

## L3 — Page Accueil

**Demande :** photo d'accueil · notre histoire · le lieu des cours
(géolocalisation et photo de la salle) · le coach · les témoignages. Le
bandeau devient **PILATES — YOGA — BIEN-ÊTRE — MOBILITÉ**.

**Ajouts :**
- ordre : haut de page → Notre histoire → Le lieu des cours → Votre coach →
  Témoignages → Réseaux → Contact ;
- **Notre histoire** : l'actuel « À propos », **sans photo**. Le chiffre du
  badge (« 20 ans… ») était posé sur la photo : il devient une pastille dans
  le texte ;
- **Le lieu des cours** (nouvelle section, modifiable dans Sanity) : titre,
  texte (accès, stationnement, accessibilité aux fauteuils), photo de la
  salle, adresse, carte (D4) et bouton « Itinéraire » qui ouvre Plans ou Maps
  sur le téléphone. La position existe déjà (`infosPratiques.positionCarte`) ;
- bandeau : contenu Sanity (`heroActivites`) ramené à 4 mots. Chaque mot mène
  à sa pratique sur `/activites` (Bien-être et Mobilité : à décider) ;
- témoignages : afficher le lien « Voir nos avis Google » même avec un seul
  avis, et gérer le cas où il n'y en a aucun ;
- photo du haut de page : celle reçue est trop petite (543 px), voir D7.

**Fini quand** les 7 blocs s'affichent dans cet ordre, que la carte et le
bouton Itinéraire marchent sur iPhone et sur Android, et que le bandeau tient
sur une ligne à 375 px.

---

## L4 — Page Activités (cours réguliers)

### L4a — Titres
**Demande :** « Nos pratiques » (gardé) · **« Cours Réguliers »** remplace
« Forme & Bien-être » · « Renforcez votre corps… » (gardé).
**Ajouts :** modification du contenu Sanity, rien dans le code.

### L4b — Les pratiques, par thème
**Demande :**
- **Yoga** : Hatha Yoga, Flow Yoga, Yin Yoga, chacun avec son explication
- **Pilates** : par niveau, Cardio Pilates, Flow Pilates, Petit matériel & Gym Ball, Yogilates
- **Fitness** : Renforcement musculaire, Gym bien-être, Cardio danse
- **Marche nordique & Outdoor** : Marche afghane, MN & Pilates, Cardio MN, MN & Yoga, MN & Renfo ludique

**Ajouts :**
- un nouveau type Sanity **`theme`** (titre, accroche, photo, ordre, liste
  de **pratiques**). Chaque pratique a un nom, une explication de 2 ou 3
  phrases et des niveaux indicatifs. Ajouter une pratique ne crée plus ni
  activité ni onglet ;
- affichage : 4 blocs thème avec leur photo, pratiques dépliables dessous.
  Une ancre par thème (`#yoga`, `#pilates`, `#fitness`, `#marche-nordique`)
  pour les liens du menu et du bandeau ;
- **migration** des 9 activités actuelles vers les 4 thèmes (« Cardio
  Pilates » devient une pratique de Pilates), par script, après la sauvegarde
  de L0. La marche nordique quitte l'onglet « Plein air » de « Plus
  d'activités » pour devenir le 4ᵉ thème ;
- **16 explications à rédiger** : Opus propose, la cliente corrige dans
  Sanity ;
- photos : les 4 photos du mail (Fitness, Yoga, Pilates, Marche nordique),
  une par thème au lieu d'une par activité.

### L4c — Planning
**Demande :** ne plus lier le planning aux onglets d'activités, et pouvoir
préciser le niveau.

**Ajouts :**
- un créneau désigne **un thème + une pratique de ce thème** (liste
  déroulante), ou un **intitulé libre** pour un cours ponctuel. « Cardio
  Pilates » se saisit donc dans le créneau, sans rien créer d'autre ;
- **le champ « Niveau » existe déjà dans Sanity mais le site ne l'affiche
  pas** : l'afficher en pastille (Séniors, Débutant, Avancé…). Ajouter
  « Intermédiaire/Avancé » si la cliente le demande ;
- une couleur discrète par thème, avec sa légende ;
- les 13 créneaux actuels migrés. « Annulations & changements » continue de
  marcher (tests de `lib/planning/moteur.js`).

### L4d — Tarifs
Reprise de la grille actuelle (`Pricing.js`). **Toujours en suspens :** la
saison (« 2025—2026 » sur le site, « ADHESION 26/27 » sur le formulaire) et le
tarif famille (410 € contre 2 × 215 €).

### L4e — Inscription
Bouton vers le formulaire Google (`infosPratiques.lienInscription`).
Règlement intérieur et conditions générales proposés en PDF dès qu'ils sont
déposés. **Ne pas** remettre la liste « il vous sera demandé… » que la
cliente a retirée.

**Fini quand** la cliente peut ajouter une pratique et un créneau avec niveau
sans créer d'activité, et que la page se lit à 320 px.

---

## L5 — Page Ateliers & Stages

**Demande :**
- des **descriptifs** (texte et photo) qu'elle peut ajouter et cumuler, en
  gardant les ateliers qui plaisent ;
- un **calendrier** des stages et ateliers passés et à venir ;
- un **bouton de réservation** vers un formulaire (Nom, Prénom, Tél, choix
  d'un ou plusieurs ateliers).

**Ajouts :**
- nouveau type Sanity **`atelier`**, fiche permanente : titre, texte, photo
  **facultative** (« pas besoin de photos »), ordre, case « afficher ».
  Un **événement** (une date) renvoie à un atelier : la description s'écrit
  une fois, les dates s'ajoutent ;
- sous chaque descriptif : ses **prochaines dates**, tirées du calendrier ;
- calendrier en **liste par mois**, plus lisible sur téléphone qu'une grille.
  Onglets « À venir » et « Passés » (12 derniers mois), statuts « Complet » et
  « Annulé » (ils existent déjà). Un clic ouvre la fiche
  `/evenements/[slug]` existante ;
- réservation (D5) : spécification exacte du formulaire Google à donner à la
  cliente (champs, cases à cocher multiples, mention RGPD). Le site
  **pré-remplit** l'atelier choisi par l'adresse du formulaire. Sans
  formulaire saisi, le bouton devient « Appeler » ;
- la frise des événements de l'accueil et l'onglet « Ateliers » de « Plus
  d'activités » déménagent ici. L'activité « Ateliers thématiques » est
  migrée puis retirée.

**Fini quand** la cliente crée un atelier puis deux dates dans le Studio, et
que le site montre le descriptif, les 2 dates dans « À venir » et un bouton
de réservation pré-rempli.

---

## L6 — Page Sur mesure

**Demande :** un paragraphe d'explication. Quatre onglets avec chacun sa
plaquette à télécharger : **Coaching personnalisé · Groupes & Asso ·
Entreprise & Évènementiel · Massage Bien-être**. Deux boutons :
« Prendre rendez-vous » (06 09 31 61 45) et « Contact » (emma@mgym.fr).

**Ajouts :**
- dans Sanity, une liste de 4 **offres** (titre, texte, plaquette PDF), qui
  remplace les deux champs actuels `plaquetteGroupes` et `plaquetteMassages`
  (vides dans Sanity aujourd'hui) ;
- onglets accessibles, sur le modèle de `PlusActivites.js`, avec une ancre
  chacun (`#coaching`, `#groupes`, `#entreprise`, `#massage`) pour envoyer un
  lien direct ;
- **PDF compressés à 5 Mo maximum** : `plaquette-massage.pdf` fait **214 Mo**
  sur le disque. Taille affichée sur le lien (« PDF, 1,8 Mo ») ;
- plaquettes manquantes : Coaching et Entreprise. Tant qu'elles manquent,
  l'onglet affiche « Plaquette sur demande » et le bouton Contact ;
- « Prendre rendez-vous » en `tel:` (appel direct sur téléphone),
  « Contact » en `mailto:` (D6) ;
- aucune photo (demande de la cliente).

**Fini quand** les 4 onglets s'ouvrent au clic et au clavier, que les PDF
téléchargés pèsent moins de 5 Mo, et que les deux boutons lancent l'appel et
l'e-mail sur iPhone.

---

## L7 — Pied de page, Réseaux, Contact, mentions légales

**Demande :** « en pied de page, on garde ce que tu as déjà mis avec le menu
allégé ».

**Ajouts :**
- menu allégé : Accueil · Activités · Ateliers & Stages · Sur mesure · Blog ·
  Réseaux · Mentions légales ;
- **page Mentions légales, obligatoire** (loi LCEN) et absente aujourd'hui :
  - éditeur : l'association, n° RNA ou SIRET, adresse ;
  - directeur de la publication ;
  - hébergeur : Netlify, avec son adresse ;
  - une ligne sur les données : les formulaires Google collectent nom et
    téléphone (RGPD).

  Les informations sont à demander à la cliente ;
- la section Réseaux reste en bas de l'accueil (D2), Facebook et Instagram
  côte à côte.

---

## L8 — Photos

**Demande :** garder ou retoucher la photo du haut de page. Pas de photo pour
« Notre histoire ». Photo du coach gardée. Une photo de la salle et une par
thème (Fitness, Yoga, Pilates, Marche nordique). Ateliers et Sur mesure sans
photo. « Réduire les photos au minimum ».

**Ajouts :**
- D7 : originaux haute définition, et accord des personnes si ce sont des
  adhérentes ;
- conversion en AVIF ou WebP **8 bits** : Sanity refuse les AVIF 10 bits,
  déjà rencontré. Envoi dans Sanity au bon champ, avec le point de recadrage
  sur le sujet ;
- retirer les photos devenues inutiles : 9 photos d'activités, photo
  « À propos », illustration IA des ateliers, photo « Sur mesure ». Puis
  supprimer les orphelines de `public/Images/`.

---

## L9 — Back-office rangé comme le site

**Ajouts** (point 8 de `FIX site.txt` : « accès total et bien intuitif ») :
- le menu du Studio (`sanity/lib/structure.js`) suit le menu du site :
  - Accueil
  - Activités : thèmes, planning, annulations, tarifs
  - Ateliers & Stages : ateliers, calendrier
  - Sur mesure
  - Blog
  - Réglages : infos pratiques, référencement
- tous les nouveaux champs ont une aide en français et une erreur
  compréhensible ;
- `npm run studio:deploy` après les changements de schéma ;
- mise à jour de `docs/GUIDE-CLIENTE.md` et de `docs/SCRIPT-VIDEO.md`.

**Fini quand** la cliente retrouve chaque élément visible du site au même
endroit dans le Studio, sans aide.

---

## L10 — Contenus à obtenir de la cliente

| Contenu | Pour | Qui rédige |
|---|---|---|
| Photos HD, et accord des personnes | L3, L4, L8 | la cliente |
| 16 explications de pratiques | L4b | Opus propose, la cliente corrige |
| Texte « Le lieu des cours » (accès, stationnement) | L3 | Opus propose |
| Paragraphe et 4 textes « Sur mesure » | L6 | la cliente, ou Opus propose |
| Descriptifs des ateliers actuels | L5 | la cliente |
| Plaquettes Coaching et Entreprise | L6 | la cliente |
| Formulaire Google de réservation | L5 | la cliente, d'après notre spécification |
| Mentions légales : RNA/SIRET, directeur de la publication | L7 | la cliente |
| Saison et tarif famille | L4d | la cliente |

---

## L11 — Vérifier et mettre en ligne

- tests : la règle des 3 fichiers (`coherence.test.mjs`), le planning
  (pratique, niveau, intitulé libre), la table des anciennes ancres, la liste
  des pages de `revalidation.test.mjs` ;
- `npm run verifier`, dans une **copie** du projet si un `next dev` tourne ;
- contrôle visuel de chaque page à 320, 375, 390, 768 et 1280 px. Le menu se
  vérifie au clavier seul ;
- fusion unique vers `main`, contrôles HTTP sur `mgym.fr`, Aperçu du Studio,
  sauvegarde après migration ;
- mise à jour de `CLAUDE.md` (le site n'est plus « une seule page ») et de
  `PASSATION.md`.

---

## Ordre de réalisation

```
D1–D7 tranchées
  └ L0 préparer
      └ L1 pages et redirections
          ├ L2 menu
          ├ L4 activités (modèle thème + planning)  ← le plus gros, la migration
          ├ L5 ateliers & stages (modèle atelier)
          ├ L6 sur mesure
          └ L3 accueil, L7 pied de page / mentions
              └ L8 photos, L9 Studio
                  └ L11 vérifier, fusionner, mettre en ligne
L10 en parallèle, dès maintenant : c'est ce qui prendra le plus de temps.
```
