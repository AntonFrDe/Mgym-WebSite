# CLAUDE.md — Site M'GYM

Site vitrine (une seule page) de l'association **M'GYM — Bien-être & Santé**,
à Mirepoix-sur-Tarn. Cible : adhérentes et adhérents adultes, souvent seniors.
La lisibilité et la simplicité priment sur l'effet technique.

## Stack

- **Next.js 15.5** (App Router) + **React 18**
- **JavaScript pur** — pas de TypeScript, pas de tests, pas de linter configuré
- **CSS global unique** : `app/globals.css` (pas de Tailwind, pas de CSS Modules)
- Polices via `next/font/google` : Cormorant Garamond (serif) + Montserrat (sans)
- Aucune dépendance en dehors de `next`, `react`, `react-dom` — **garder cet état**

## Commandes

```bash
npm run dev            # développement, http://localhost:3000
npm run build          # export statique dans out/ (doit passer avant de livrer)
npm start              # sert out/ via serve.js (nécessite un build préalable)
./launch.sh            # build + start + health check HTTP (usage courant)
./launch.sh --dev      # mode dev sans build
PORT=4000 ./launch.sh  # autre port
node build-standalone.js   # copie autonome du site (voir « Livraison » plus bas)
```

Il n'y a **pas** de suite de tests ni de commande de lint dans ce projet.
La vérification de référence est `npm run build` (elle échoue sur toute erreur
de compilation ou de type inféré).

`next start` **ne fonctionne pas** ici : avec `output: 'export'` il n'y a plus
de serveur Next à lancer, seulement des fichiers. C'est `serve.js` — 80 lignes
sur le module `http` de Node, sans dépendance — qui sert `out/`. Toute
modification de `next.config.js` doit s'accompagner d'un essai réel de
`./launch.sh` : c'est exactement ce qui a cassé la commande en silence par le
passé.

## Architecture

```
app/
  layout.js      # <html>/<body>, polices, metadata SEO, Nav + ClientLayout
  page.js        # LA page d'accueil : n'assemble que des composants
  globals.css    # 100 % du style du site, organisé par section
components/
  Nav.js         # nav fixe + menu hamburger mobile ('use client')
  Hero.js        # image plein écran + bande d'activités en verre dépoli
  Manifesto.js   # citation sur bandeau sombre
  About.js       # histoire de l'association
  activitesData.js       # SOURCE UNIQUE des 8 activités
  EnteteActivites.js     # titre + chapô, partagés par les deux affichages
  SentierActivites.js    # affichage « sentier » vertical ('use client')
  CarrouselActivites.js  # affichage « cartes horizontales » ('use client')
  Outdoor.js             # « Explorez aussi » : marche nordique & outdoor
  liens.js               # adresses des formulaires en ligne (un seul endroit)
  Bespoke.js Coach.js Pricing.js Planning.js Reseaux.js Contact.js Footer.js
  ClientLayout.js # IntersectionObserver global pour les classes .apparition
public/Images/   # toutes les photos, en .avif (sauf CoachPhoto.webp)
public/fond1.avif # fond du hero
serve.js         # sert out/ en local, sans dépendance (cf. « Commandes »)
```

Le site est **une seule route** : toute la navigation se fait par ancres
(`#about`, `#activites`, `#coach`, `#tarifs`, `#planning`, `#reseaux`,
`#contact`). Si l'`id` d'une section change, mettre à jour `Nav.js`,
`Footer.js` et les CTA qui pointent dessus.

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
| Rose principal | `--rose` | `#D18B8E` |
| Rose foncé (hover) | `--rose-fonce` | `#B8737A` |
| Rose clair (fonds alternés) | `--rose-clair` | `#F4E1E6` |
| Rose pâle (italique du hero) | `--rose-pale` | `#F4C4C7` |
| Fond crème | `--creme` | `#FFF7F8` |
| Prune (texte, bandeaux sombres) | `--prune` | `#4A3B42` |
| Blanc (texte sur fond coloré) | `--blanc` | `#fff` |

Pour une transparence, utiliser la variante `-rgb` :
`rgba(var(--prune-rgb), .12)` — `rgba()` ne sait pas lire un hexadécimal.

- Les sections **alternent** `var(--creme)` et `var(--rose-clair)`. En insérant une section,
  vérifier que l'alternance tient encore.
- **Lisibilité : ne jamais descendre sous `.85rem` (≈13.6 px)** pour du texte
  courant. Les commentaires `/* LISIBILITÉ : ... */` dans `globals.css` marquent
  ces choix — ce sont des contraintes du client, pas des préférences.
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

## Le bloc « Activités » — deux affichages

Les 8 activités vivent dans **`components/activitesData.js`**, classées de la
plus douce à la plus intense (Yin Yoga, Yoga, Yogilates, Pilates, Gym
Bien-être, Forme & Force), les deux offres sur mesure fermant la marche
(Ateliers thématiques, Prestations sur mesure). **L'ordre du tableau est
l'ordre affiché** : déplacer une ligne change le classement partout.
Deux composants les affichent différemment ; `app/page.js` en choisit un :

| Composant | Principe | `MGYM_VARIANT` |
|---|---|---|
| `CarrouselActivites.js` | 8 cartes qui défilent à l'horizontale à la molette, au doigt, aux flèches | *(vide)* — affichage par défaut |
| `SentierActivites.js` | chemin sinueux vertical tracé au défilement (SVG `stroke-dashoffset`), étapes alternées gauche/droite, panneau dépliable | `sentier` |

Le choix se fait par la variable d'environnement `MGYM_VARIANT` dans
`app/page.js` (`MGYM_VARIANT=sentier npm run build`), sans toucher au code.

**Ne jamais dupliquer les activités** dans un composant : ni le tableau de
données (`activitesData.js`), ni l'en-tête de la section
(`EnteteActivites.js`, dont seule la phrase d'instruction change d'un
affichage à l'autre). Cette en-tête a longtemps été recopiée dans les deux
fichiers, et une correction sur deux se perdait.

### Règles du carrousel horizontal

- La molette n'est capturée **que tant qu'il reste des cartes** dans la
  direction demandée ; arrivé en bout, la page reprend son défilement vertical.
  Sans cela l'utilisateur est piégé dans la section.
- L'écouteur `wheel` doit être posé en natif avec `{ passive: false }` :
  la prop React `onWheel` est passive, `preventDefault()` y est sans effet.
- La barre de défilement native est masquée pour des raisons esthétiques : en
  contrepartie, **les affordances de remplacement sont obligatoires** (carte
  coupée au bord droit, indice de départ, jauge de progression, compteur,
  flèches, touches ←/→, piste `tabIndex={0}`).
- Les dimensions (largeur de carte, `gap`) restent définies en CSS ; le JS les
  **mesure** dans le DOM (`pasDeDefilement`). Ne pas coder de largeur en dur
  dans le composant.

## Livraison au client — `Site-MGYM-{sentier,carousel}.html`

`build-standalone.js` produit, depuis `out/`, une copie du site qui s'ouvre par
double-clic sans serveur. **Deux formats**, selon l'usage :

```bash
# Fichier unique (~1,6 Mo, images en base64) — pratique à envoyer par mail
npm run build:html:sentier    # Site-MGYM-sentier.html
npm run build:html:carousel   # Site-MGYM-carousel.html
npm run build:html:all        # les deux

# Dossier unique (~1,4 Mo, photos en fichiers séparés) — à déposer sur Drive
npm run livraison             # les deux versions dans Livraison-MGYM/
npm run livraison:carousel    # n'y dépose que la page « cartes »
npm run livraison:sentier     # n'y dépose que la page « chemin »
```

`Livraison-MGYM/` est **un seul dossier** contenant les deux versions du site :

```
Livraison-MGYM/
  Site-MGYM-activites-en-cartes.html   # variante carrousel
  Site-MGYM-activites-en-chemin.html   # variante sentier
  Images/          # partagé par les deux pages
  fond1.avif
  LISEZ-MOI.txt    # écrit pour la cliente, pas pour un développeur
```

Les photos restent des fichiers visibles : les remplacer par un fichier de
même nom met à jour les deux pages d'un coup. Le mode `--dossier` **ne vide
jamais** `Livraison-MGYM/` : les deux variantes s'y écrivent l'une après
l'autre, un nettoyage effacerait la page du passage précédent.

Les deux formats (fichier unique / dossier) partagent tout le reste — seul le
traitement des images diffère (`transformeImage` dans `build-standalone.js`).

Pièges à connaître :

- Le script **retire tous les `<script>` de Next**. Aucune interactivité React
  ne survit. Toute interaction nouvelle doit être **réécrite en JS vanilla**
  dans la constante `inlineJs` de `build-standalone.js` (c'est déjà le cas pour
  la nav, le menu mobile, les classes `.apparition`, le carrousel, et pour le
  sentier : révélation des étapes, tracé du chemin au défilement, bouton
  « En savoir plus »). **Renommer une classe utilisée par ce script sans le
  mettre à jour casse silencieusement le fichier livré, jamais le site Next.**
- Les liens vers les images doivent rester **absolus** dans le code source
  (`/Images/xxx`) : c'est ce que `build-standalone.js` détecte pour les
  transformer, en base64 ou en chemin relatif selon le format.
- **Un state React invisible à l'export est un contenu perdu.** Un bloc rendu
  conditionnellement (`{estOuvert && …}`) est simplement absent du HTML
  produit. C'est ce qui rendait les descriptions d'activités introuvables dans
  le fichier livré. Règle : rendre le contenu **toujours**, et le masquer avec
  l'attribut `hidden` que React et le JS inline basculent tous les deux.
- De même, une classe posée par un state React (`est-visible` sur `.etape`) ne
  sera jamais posée dans le fichier autonome : il faut son équivalent dans
  `inlineJs`, sinon la section reste en `opacity:0`.
- Le script lit le dossier **`out/`**, produit par l'export statique
  (`output: 'export'` est bien présent dans `next.config.js`). Toujours
  relancer un build avant `node build-standalone.js`.

## Hygiène du dépôt

Rien de ce que produit une commande ne doit être commité. `out/`,
`Livraison-MGYM/` et les `Site-MGYM*.html` sont dans `.gitignore` : ils se
régénèrent en une commande et pèsent plusieurs mégaoctets chacun. Avant de
committer, vérifier que `git status` ne liste que des fichiers écrits à la
main.

Les photos non référencées sont à supprimer : `build-standalone.js` copie
**tout** `public/Images/` dans le dossier de livraison, une image inutilisée
part donc chez la cliente. Pour lister les orphelines :

```bash
for img in public/Images/*; do
  b=$(basename "$img")
  grep -qr "$b" components/ app/ || echo "orpheline : $b"
done
```

## Ce qu'il ne faut pas faire

- Ajouter une dépendance npm pour un besoin réalisable en CSS ou en 30 lignes.
- Introduire TypeScript, Tailwind, ou un système de composants — le projet est
  volontairement lisible par une personne débutante.
- Réduire la taille du texte ou le contraste pour un gain esthétique.
- Rendre une interaction indispensable sans alternative clavier et tactile.
- Laisser un texte anglais dans l'interface : le site est intégralement en
  français.
