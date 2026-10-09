# CLAUDE.md — Site M'GYM

Site vitrine (une seule page) de l'association **M'GYM — Bien-être & Santé**,
à Mirepoix-sur-Tarn. Cible : adhérentes et adhérents adultes, souvent seniors.
La lisibilité et la simplicité priment sur l'effet technique.

## Stack

- **Next.js 15.5** (App Router) + **React 19** (19.2 minimum : exigé par le
  Studio Sanity 5, dont l'outil « Aperçu » s'adapte aux téléphones)
- **JavaScript pur** — pas de TypeScript, pas de linter. 67 tests via
  `node --test` (aucune dépendance de test)
- **CSS global unique** : `app/globals.css` (pas de Tailwind, pas de CSS Modules)
- Polices via `next/font/google` : Cormorant Garamond (serif) + Montserrat (sans)
- **Aucune dépendance INUTILE.** La règle n'est plus « exactement trois
  dépendances » : Sanity en a ajouté sept, toutes nécessaires. Toute
  nouvelle dépendance doit être justifiée, maintenue et auditée.
- **Node 20.19 minimum** — tous les paquets Sanity l'exigent (voir `.nvmrc`)

## Commandes

```bash
npm run dev            # développement, http://localhost:3000
npm run studio:dev     # le back-office,  http://localhost:3333
npm run verifier       # schémas + requêtes + 67 tests + build
npm run build          # build du site hébergé
npm start              # le sert (next start)
./launch.sh            # build + start + vérification qu'il répond
./launch.sh --dev      # mode dev sans build
PORT=4000 ./launch.sh  # autre port
```

La vérification de référence est `npm run verifier`. Il n'y a pas de linter.

Le site est **entièrement généré au build** et servi par Netlify. Seules les
routes `/api/*` (aperçu des brouillons) sont dynamiques : la prévisualisation
du Studio exige un serveur.

## Architecture

```
app/
  layout.js      # <html>/<body>, polices, metadata SEO, Nav + ClientLayout
  page.js        # LA page d'accueil : n'assemble que des composants
  globals.css    # 100 % du style du site, organisé par section
  blog/, evenements/[slug]/   # les seules routes en plus de l'accueil
components/
  Nav.js         # nav fixe + menu hamburger mobile ('use client')
  Hero.js        # image plein écran + bande d'activités en verre dépoli
  Manifesto.js   # citation sur bandeau sombre
  About.js       # histoire de l'association
  activitesData.js       # SOURCE UNIQUE des 8 activités
  EnteteActivites.js     # titre + chapô du carrousel
  CarrouselActivites.js  # affichage des activités en cartes horizontales ('use client')
  PlusActivites.js       # 3 onglets : ateliers · sur mesure · plein air ('use client')
  Evenements.js          # frise des stages & événements (fiches : app/evenements)
  Temoignages.js         # avis, sous la coach ; note Google
  BlogApercu.js          # 3 derniers articles (masqué sans article)
  LienItineraire.js      # ouvre Plans / Google Maps / geo: selon l'appareil ('use client')
  pictogrammes.js        # TOUS les pictogrammes et logos de réseaux
  liens.js               # adresses des formulaires en ligne (un seul endroit)
  Coach.js Pricing.js Planning.js Reseaux.js Contact.js Footer.js
  ClientLayout.js # IntersectionObserver global pour les classes .apparition
public/Images/   # toutes les photos, en .avif (sauf CoachPhoto.webp)
public/fond1.avif # fond du hero
```

L'accueil se parcourt par ancres (`#about`, `#activites`, `#plus-activites`,
`#coach`, `#temoignages`, `#tarifs`, `#planning`, `#evenements`,
`#reseaux`, `#contact`). Si l'`id` d'une section change, mettre à jour la
liste `LIENS` de `Nav.js`, `Footer.js` et les CTA qui pointent dessus.

`#bespoke`, `#outdoor` et `#ateliers` ne sont plus des sections mais les
**boutons d'onglets** de « Plus d'activités » : les anciens liens (y compris
ceux saisis dans le back-office) y mènent toujours ET ouvrent le bon onglet.

Le carrousel ne montre que les activités de rubrique « cours » ; les fiches
« ateliers » et « surMesure » vont dans les onglets
(`lib/contenu/rubriques.js`, repli sur l'adresse web des fiches anciennes).

## Conventions du code

- **Le français partout** : noms de variables, commentaires, classes CSS
  métier (`.etape`, `.carte-act`, `.carrousel-piste`). Les commentaires sont
  volontairement pédagogiques — la personne qui reprend ce code n'est pas
  développeuse. Conserver ce niveau d'explication.
- **Composants serveur par défaut.** `'use client'` uniquement si le composant
  touche à `window`, `IntersectionObserver`, un événement ou un état. Dans ce
  cas, expliquer *pourquoi* en commentaire en haut du fichier (voir `Nav.js`).
- **Données en tête de fichier** : chaque section déclare son tableau de
  données (`prices`, `certifications`, `types`…) au-dessus du composant, puis
  fait un `.map()`. C'est ce qui permet de modifier un tarif ou un texte sans
  toucher au JSX.
- **Pas de `<Image>` de Next** : les photos sont des `<img>` avec
  `loading="lazy"`. Le projet privilégie la simplicité et l'export statique.
- **CSS** : ajouter les styles dans `globals.css`, dans la section commentée
  correspondante (`/* ── ACTIVITÉS ── */`, `/* ── TARIFS ── */`…), pas en
  vrac à la fin.
- **Aucun `style={{ }}` dans le JSX**, aucune couleur en dur dans un
  composant. La seule exception admise est une valeur *calculée à l'exécution*
  (la jauge du carrousel, dont la largeur dépend du défilement). Tout le reste
  est une classe dans `globals.css`.

## Design system

Les couleurs sont des **variables CSS**, déclarées une seule fois dans le bloc
`:root` en haut de `globals.css`. Ne jamais réécrire un code hexadécimal
ailleurs : `var(--rose)`, pas `#D18B8E`.

| Rôle | Variable | Valeur |
|---|---|---|
| Rose principal — **décor seulement** | `--rose` | `#D18B8E` |
| Rose foncé — **texte rose et boutons** | `--rose-fonce` | `#985258` |
| Rose clair (fonds alternés) | `--rose-clair` | `#F4E1E6` |
| Rose pâle (italique du hero) | `--rose-pale` | `#F4C4C7` |
| Fond crème | `--creme` | `#FFF7F8` |
| Prune (texte, bandeaux sombres) | `--prune` | `#4A3B42` |
| Blanc (texte sur fond coloré) | `--blanc` | `#fff` |
| Texte secondaire (prune à 80 %) | `--texte-doux` | `rgba(prune, .8)` |

Pour une transparence, utiliser la variante `-rgb` :
`rgba(var(--prune-rgb), .12)` — `rgba()` ne sait pas lire un hexadécimal.

- **Ambiances** : pour ne plus alterner crème/rose sur toute la page, trois
  teintes d'appoint — `--lin`, `--sauge-clair`/`--sauge-fonce`,
  `--lavande-clair`/`--lavande-fonce`. Une section d'ambiance redéfinit
  `--accent-texte` et `--accent-decor` (étiquette, mot italique, filet, ✦) ;
  les **boutons restent roses partout**. Ordre actuel des fonds : À propos
  crème · Activités rose · Plus d'activités sauge · Coach lin · Témoignages
  crème · Tarifs lin · Planning rose · Événements lavande · Blog crème ·
  Réseaux lin · Contact rose. Jamais deux fonds identiques côte à côte.
- **Images** : toujours à leurs proportions naturelles (`height:auto`). Une
  hauteur fixe recadrait le portrait de la coach et les illustrations.
- **Contraste : deux roses, deux rôles.** `--rose` ne passe pas le minimum
  lisible pour du texte (2,7:1 sur blanc, 2,15:1 sur rose clair ; il faut
  4,5:1). Tout **texte** rose sur fond clair et tout **bouton** rose à texte
  blanc utilisent `--rose-fonce` ; `--rose` reste aux filets, ✦,
  pictogrammes, bordures et au texte sur le bandeau prune. Survol d'un
  bouton : `--prune` (sur fond prune : un liseré `--rose-pale`).
- **Jamais `opacity` pour griser un texte** : elle délave aussi les liens et
  les mots en gras qu'il contient, et un enfant ne peut pas l'annuler.
  Utiliser `color: var(--texte-doux)`. En dessous de 80 %, le prune n'est
  plus lisible sur le rose clair.

- Les sections **alternent** `var(--creme)` et `var(--rose-clair)`. En insérant une section,
  vérifier que l'alternance tient encore.
- **Lisibilité : ne jamais descendre sous `.85rem` (≈13.6 px)** pour du texte
  courant. Les commentaires `/* LISIBILITÉ : ... */` dans `globals.css` marquent
  ces choix — ce sont des contraintes du client, pas des préférences.
- **Sur téléphone (≤ 700 px), c'est plus strict** : `.85rem` pour TOUT texte,
  étiquettes comprises, et `1rem` pour les paragraphes ; cibles tactiles de
  44 px minimum ; boutons en pleine largeur. Le bloc « TÉLÉPHONE » de la
  media query 700 px regroupe ces règles, chacune avec la mesure qui l'a
  motivée. Vérifier à 320, 360, 375 et 390 px de large : le haut de page
  (bande d'activités), les cartes du carrousel et les boutons étaient cassés
  à 320–375 px alors que 390 px paraissait correct.
- Titres en serif light, étiquettes en sans-serif capitales très espacées
  (`letter-spacing: .2em` à `.35em`), boutons en pilules (`border-radius: 3rem`).

## Animations

Deux mécanismes, à ne pas confondre :

1. **`.apparition` / `.apparition-gauche` / `.apparition-droite`** — apparition
   en fondu au défilement. La classe `.est-apparu` est posée par
   l'`IntersectionObserver` de `ClientLayout.js`, qui requête le DOM **une
   seule fois au montage**. Un élément `.apparition` rendu plus tard (après un
   clic, un filtre…) ne sera jamais révélé : dans ce cas, gérer la visibilité
   dans le composant lui-même.
   Le décalage entre éléments voisins se règle avec `.retard-1` … `.retard-6`.
   *Ces classes s'appelaient `.sr` / `.on` / `.d1`. « sr » veut dire* screen
   reader *partout ailleurs dans le métier : ne pas revenir à ce nom. Le vrai
   masquage accessible du projet est `.visuellement-masque`.*
2. **États locaux des composants d'activités** (`estVisible`, `estOuvert`) —
   chacun a sa propre source (l'observer / le clic) et **ne doit jamais
   réinitialiser l'autre**. Un bug déjà rencontré sur l'ancien accordéon venait
   de là : le clic effaçait la classe posée par l'observer.

Toute animation doit être neutralisée dans le bloc
`@media (prefers-reduced-motion: reduce)`, **placé en dernier dans
`globals.css`** pour l'emporter sur les media queries de largeur.

## Le bloc « Activités » — le carrousel

Les 8 activités vivent dans **`components/activitesData.js`**, classées de la
plus douce à la plus intense (Yin Yoga, Yoga, Yogilates, Pilates, Gym
Bien-être, Forme & Force), les deux offres sur mesure fermant la marche
(Ateliers thématiques, Prestations sur mesure). **L'ordre du tableau est
l'ordre affiché** : déplacer une ligne change le classement partout.

**Ne jamais dupliquer les données des activités** dans plusieurs composants.
Le contenu vient de Sanity ; `activitesData.js` n'en est que le repli,
lu par `lib/contenu/source-historique.mjs`.

### Règles du carrousel horizontal

- **La molette verticale n'est JAMAIS détournée** : elle fait défiler la
  page, même au-dessus des cartes. Le carrousel la détournait autrefois vers
  les cartes ; avec l'aimantation (`scroll-snap` obligatoire), chaque cran
  était ramené à la carte de départ et la page ne défilait plus : le visiteur
  était BLOQUÉ tant que sa souris survolait le carrousel (mesuré : six crans,
  zéro pixel). Les cartes se parcourent au doigt, au geste horizontal du pavé
  tactile (natif), aux flèches et au clavier.
- La barre de défilement native est masquée pour des raisons esthétiques : en
  contrepartie, **les affordances de remplacement sont obligatoires** (carte
  coupée au bord droit, indice de départ, jauge de progression, compteur,
  flèches, touches ←/→, piste `tabIndex={0}`).
- Les dimensions (largeur de carte, `gap`) restent définies en CSS ; le JS les
  **mesure** dans le DOM (`pasDeDefilement`). Ne pas coder de largeur en dur
  dans le composant.
- **Sur téléphone, une carte doit tenir dans l'écran.** La description y est
  coupée à quatre lignes (`-webkit-line-clamp`) avec un bouton « Lire la
  suite » (`.carte-act-suite`, classe `.est-ouverte` sur la carte). Le texte
  reste entier dans le HTML. Entière, la plus longue description donnait une
  carte de 733 px pour 600 px visibles.

## Le CMS — ce qu'il faut savoir avant d'y toucher

Le contenu vient de Sanity, avec un **repli** sur `lib/contenu/defaut.js`.
Sans projet configuré, le site affiche exactement ce qu'il affichait avant :
c'est l'état initial. **En production, une panne de Sanity n'utilise PAS ce
repli** (`lib/sanity/fetch.js` lève l'erreur) : le build échoue et Netlify
garde la version précédente, ou la régénération échoue et Next garde la
dernière page bonne. Le repli mis en cache affichait sinon d'anciens tarifs
sans la moindre erreur.

**Trois fichiers décrivent les mêmes champs** et rien ne les relie
automatiquement :

```
sanity/schemaTypes/siteContent.js   ce que la cliente peut remplir
lib/sanity/queries/groq.js          ce que le site va chercher
lib/contenu/source-historique.mjs   ce qu'il affiche à défaut
```

Ajouter un champ dans l'un sans les autres donne un champ rempli pour rien,
ou un texte non modifiable. `npm test` le détecte — l'oubli s'est produit
deux fois pendant le développement.

Vérifications avant de livrer :

```bash
npm run verifier   # schémas + requêtes + 67 tests + build
```

Documentation complète dans `docs/` : SECURITY, ROLLBACK, SANITY-SCHEMAS,
GUIDE-CLIENTE, FINAL-BACKEND-AUDIT.

## L'Aperçu du Studio (outil Presentation)

Le back-office affiche le site à côté du formulaire, en direct, avec
clic-pour-modifier. Les pièces, et ce qu'il ne faut pas casser :

- `sanity/lib/presentation.js` : l'adresse du site (`SANITY_STUDIO_PREVIEW_ORIGIN`,
  défaut `https://mgym.fr`), les routes, et quelle page montre quel document.
- `app/api/draft-mode/enable` : vérifie le secret que le STUDIO a créé
  (aucun secret dans le code du Studio, qui est public). Pose les cookies
  en `Partitioned` dans le cadre du Studio : **sans cet attribut, Safari
  (donc tout iPhone) jette le cookie et l'aperçu montre le contenu publié.**
- `components/EditionVisuelle.js` : cadres cliquables + `router.refresh()`
  à chaque modification. Ne PAS revenir au rafraîchissement par défaut de
  next-sanity, qui purge le cache de tout le site à chaque frappe.
- **Stega** (`lib/sanity/stega.js`) : en aperçu, des caractères invisibles
  s'ajoutent aux textes. Tout champ que le code COMPARE ou TRANSFORME
  (statut, jour, heure, téléphone…) doit figurer dans `CHAMPS_SANS_STEGA`,
  sinon il casse en aperçu seulement — le pire des bugs, invisible en ligne.
- CSP : `frame-ancestors` n'autorise que le Studio ; `X-Frame-Options` est
  retiré (il ne sait pas autoriser un autre domaine).
- Les variables de développement (`localhost`) vont dans `.env.development`,
  **jamais** dans `.env.local` : `studio:deploy` le lit aussi, et le Studio
  en ligne prévisualiserait localhost.

## Le Studio : à redéployer après chaque changement de schéma

Les modèles (`sanity/schemaTypes`) et les actions du back-office
(`sanity/lib`) ne sont vus par la cliente qu'après `npm run studio:deploy`.
Le bouton **Publier** des articles et événements remplit lui-même l'adresse
web (`avecAdresseAutomatique`, `lib/adresse-web.js`) : ne pas rétablir une
validation BLOQUANTE sur le slug, c'est ce qui empêchait la cliente de
publier ses événements.

## Hygiène du dépôt

Avant de committer, vérifier que `git status` ne liste que des fichiers
écrits à la main — les produits de build sont dans `.gitignore`.

Les photos non référencées alourdissent le dépôt pour rien. Pour lister les
orphelines :

```bash
for img in public/Images/*; do
  b=$(basename "$img")
  grep -qr "$b" components/ app/ || echo "orpheline : $b"
done
```

## Ce qu'il ne faut pas faire

- Ajouter une dépendance npm pour un besoin réalisable en CSS ou en 30 lignes.
- Introduire Tailwind ou un système de composants — le projet est
  volontairement lisible par une personne débutante. TypeScript reste écarté
  au profit de JSDoc, mais ce n'est plus un interdit absolu : ce serait une
  décision explicite, pas un effet de bord.
- **Appeler Sanity depuis un composant.** Les composants reçoivent des
  props. `app/page.js` récupère le contenu une fois et le distribue.
- **Récupérer du contenu dans un `useEffect`.** Les données doivent être
  présentes au premier rendu, sinon les animations se remontent.
- **Utiliser le titre comme clé React** (`key={act.titre}`). Toujours `_id`.
- Réduire la taille du texte ou le contraste pour un gain esthétique.
- Rendre une interaction indispensable sans alternative clavier et tactile.
- Laisser un texte anglais dans l'interface : le site est intégralement en
  français.
