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
npm run build          # build de production (doit toujours passer avant de livrer)
npm start              # serveur de production
./launch.sh            # build + start + health check HTTP (usage courant)
./launch.sh --dev      # mode dev sans build
PORT=4000 ./launch.sh  # autre port
node build-standalone.js   # génère Site-MGYM.html (voir « Livraison » plus bas)
```

Il n'y a **pas** de suite de tests ni de commande de lint dans ce projet.
La vérification de référence est `npm run build` (elle échoue sur toute erreur
de compilation ou de type inféré).

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
  SentierActivites.js    # affichage « sentier » vertical ('use client')
  CarrouselActivites.js  # affichage « cartes horizontales » ('use client')
  Bespoke.js Coach.js Pricing.js Planning.js Reseaux.js Contact.js Footer.js
  ClientLayout.js # IntersectionObserver global pour les animations .sr
public/Images/   # toutes les photos, en .avif (sauf CoachPhoto.webp)
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

## Design system (valeurs en dur, pas de variables CSS)

| Rôle | Valeur |
|---|---|
| Rose principal | `#D18B8E` |
| Rose foncé (hover) | `#B8737A` |
| Rose clair (fonds alternés) | `#F4E1E6` |
| Fond crème | `#FFF7F8` |
| Prune (texte, bandeaux sombres) | `#4A3B42` |

- Les sections **alternent** `#FFF7F8` et `#F4E1E6`. En insérant une section,
  vérifier que l'alternance tient encore.
- **Lisibilité : ne jamais descendre sous `.85rem` (≈13.6 px)** pour du texte
  courant. Les commentaires `/* LISIBILITÉ : ... */` dans `globals.css` marquent
  ces choix — ce sont des contraintes du client, pas des préférences.
- Titres en serif light, étiquettes en sans-serif capitales très espacées
  (`letter-spacing: .2em` à `.35em`), boutons en pilules (`border-radius: 3rem`).

## Animations

Deux mécanismes, à ne pas confondre :

1. **`.sr` / `.sr-l` / `.sr-r`** — apparition en fondu au défilement. La classe
   `.on` est posée par l'`IntersectionObserver` de `ClientLayout.js`, qui
   requête le DOM **une seule fois au montage**. Un élément `.sr` rendu plus
   tard (après un clic, un filtre…) ne sera jamais révélé : dans ce cas, gérer
   la visibilité dans le composant lui-même.
2. **États locaux des composants d'activités** (`estVisible`, `estOuvert`) —
   chacun a sa propre source (l'observer / le clic) et **ne doit jamais
   réinitialiser l'autre**. Un bug déjà rencontré sur l'ancien accordéon venait
   de là : le clic effaçait la classe posée par l'observer.

Toute animation doit être neutralisée dans le bloc
`@media (prefers-reduced-motion: reduce)`, **placé en dernier dans
`globals.css`** pour l'emporter sur les media queries de largeur.

## Le bloc « Activités » — deux affichages

Les 8 activités (Pilates, Yoga, Yogilates, Gym Bien-être, Forme & Force,
Prestations sur mesure, Yin Yoga, Accompagnement sur mesure) vivent dans
**`components/activitesData.js`**. Deux composants les affichent
différemment ; `app/page.js` en choisit un :

| Composant | Principe | Branche |
|---|---|---|
| `SentierActivites.js` | chemin sinueux vertical tracé au défilement (SVG `stroke-dashoffset`), étapes alternées gauche/droite, panneau dépliable | `main` / branches de prod |
| `CarrouselActivites.js` | 8 cartes qui défilent à l'horizontale à la molette, au doigt, aux flèches | `teste-template` |

Pour changer d'affichage : un seul import à modifier dans `app/page.js`.
**Ne jamais dupliquer le tableau d'activités** dans un composant.

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

## Livraison au client — `Site-MGYM.html`

`node build-standalone.js` assemble un **fichier HTML unique** (~6 Mo, images
en base64) que la cliente ouvre par double-clic, sans serveur.

Pièges à connaître :

- Le script **retire tous les `<script>` de Next**. Aucune interactivité React
  ne survit. Toute interaction nouvelle doit être **réécrite en JS vanilla**
  dans la constante `inlineJs` de `build-standalone.js` (c'est déjà le cas pour
  la nav, le menu mobile, les animations `.sr` et le carrousel).
- Le script lit le dossier **`out/`**, produit par un export statique.
  État actuel : `next.config.js` ne contient **pas** `output: 'export'` et le
  dossier `out/` est obsolète (antérieur au sentier d'activités). Le HTML
  autonome doit donc être régénéré — ajouter `output: 'export'` avant de
  relancer `next build` puis `node build-standalone.js`.

## Ce qu'il ne faut pas faire

- Ajouter une dépendance npm pour un besoin réalisable en CSS ou en 30 lignes.
- Introduire TypeScript, Tailwind, ou un système de composants — le projet est
  volontairement lisible par une personne débutante.
- Réduire la taille du texte ou le contraste pour un gain esthétique.
- Rendre une interaction indispensable sans alternative clavier et tactile.
- Laisser un texte anglais dans l'interface : le site est intégralement en
  français.
