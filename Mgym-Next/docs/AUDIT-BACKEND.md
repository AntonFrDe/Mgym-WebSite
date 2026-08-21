# AUDIT-BACKEND — Site M'GYM

> **Phase 0 du plan d'implémentation.** Aucun fichier du projet n'a été modifié
> pour produire ce document.
> Date : 21 août 2026 · Dépôt : `AntonFrDe/Mgym-WebSite`, branche `REFONTE-3`.

---

## 1. Architecture actuelle

### 1.1 Pile technique

| Point | Réalité constatée |
|---|---|
| Framework | **Next.js 15.5.19**, App Router |
| React | 18.3.1 / react-dom 18.3.1 |
| Node | v18.19.1 |
| TypeScript | **Absent** — aucun `tsconfig.json`, aucun `.ts`/`.tsx` hors généré |
| Mode de rendu | `output: 'export'` — export statique intégral vers `out/` |
| Routing | **Une seule route** (`app/page.js`), navigation par ancres |
| État | `useState`/`useRef` locaux. Ni Context, ni store |
| Styles | `app/globals.css`, 944 lignes. Ni Tailwind, ni CSS Modules |
| Dépendances | **3** : `next`, `react`, `react-dom` |
| Gestionnaire | npm, `package-lock.json` commité |

### 1.2 Utilisation réelle de l'App Router

`app/` ne contient que trois fichiers : `layout.js`, `page.js`, `globals.css`.
**Aucun `route.js`, aucune API, aucune fonction serverless, aucun middleware,
aucun webhook.** Le dossier `pages/` n'existe pas.

### 1.3 Répartition serveur / client

| Type | Composants |
|---|---|
| **Client** (`'use client'`) | `Nav.js`, `ClientLayout.js`, `SentierActivites.js`, `CarrouselActivites.js` |
| **Serveur** (défaut) | `About`, `Bespoke`, `Coach`, `Contact`, `EnteteActivites`, `Footer`, `Hero`, `LienFormulaire`, `Manifesto`, `Outdoor`, `Planning`, `Pricing`, `Reseaux`, `liens`, `activitesData` |

`Bespoke.js` est le seul composant serveur à lire le disque : il vérifie au
build l'existence de `public/documents/Plaquette-MGYM.pdf` via `fs.existsSync`
pour n'afficher le bouton de téléchargement que si le fichier est présent.

### 1.4 Sources de données actuelles

**Il n'y a aucune source externe.** Zéro appel réseau, zéro `fetch`, zéro API.
Tout le contenu est écrit en dur dans les composants, sous deux formes :

1. **Tableaux de données en tête de fichier** — la convention documentée du
   projet. `activitesData.js`, `Pricing.js`, `Planning.js`, `Coach.js`, etc.
2. **Texte littéral dans le JSX** — paragraphes rédactionnels, titres, chapôs.

### 1.5 Cache et génération

Aucune stratégie de cache : l'export statique produit des fichiers, servis
tels quels. Pas d'ISR, pas de `revalidate`, pas de `fetch` à mettre en cache.

### 1.6 Build et déploiement

```
npm run dev            développement
npm run build          export statique dans out/
npm start              sert out/ via serve.js (module http, sans dépendance)
./launch.sh            build + start + health check
npm run livraison      dossier Livraison-MGYM/ pour Google Drive
npm run build:html:all deux fichiers HTML autonomes de ~1,6 Mo
```

**Aucun hébergement configuré** : ni Vercel, ni Netlify, ni CI, ni Docker.
La livraison actuelle est un fichier HTML autonome déposé sur Google Drive.

`build-standalone.js` (344 lignes) lit `out/`, retire **tous** les `<script>`
de Next et réimplémente en JS vanilla la nav, le menu mobile, les apparitions,
le carrousel et le sentier.

### 1.7 Domaine et hébergeur réels

Vérifié par DNS, HTTP et RDAP AFNIC le 21 août 2026 :

```
mgym.fr        HTTP 200   server: hcdn   x-powered-by: HostingerWebsiteBuilder
www.mgym.fr    HTTP 200
admin.mgym.fr  aucun enregistrement DNS
Domaine déposé le 29/06/2022, expire le 29/06/2027
```

> **`mgym.fr` sert un site différent de ce dépôt**, construit avec Hostinger
> Website Builder, qui possède déjà une page blog (`/blog-list`, vide) et
> **un éditeur visuel donnant déjà son autonomie à la cliente**.
> Le dépôt Next.js est une refonte jamais déployée.

Ce que Sanity apporte réellement dans ce contexte n'est donc pas l'autonomie —
elle existe — mais **l'autonomie sans possibilité de casser le design**, plus
un planning structuré et un SEO maîtrisé.

### 1.8 Variables d'environnement

| Variable | Où | Statut |
|---|---|---|
| `MGYM_VARIANT` | lue dans `app/page.js` | Choisit l'affichage des activités (`sentier` / vide) |
| `PORT`, `HOST` | `serve.js`, `launch.sh` | Port et hôte du serveur local |
| `KOKO_PRO_TOKEN` | `.env.local` | Présent, **correctement ignoré par git** |

`.gitignore` ne couvre que `.env*.local` : **`.env` et `.env.production`
passeraient**. Aucun `.env.example`.

### 1.9 Système d'animations

Trois mécanismes indépendants, tous maison, sans dépendance :

1. **`.apparition` / `-gauche` / `-droite`** → `ClientLayout.js` pose
   `.est-apparu` via un `IntersectionObserver` global, requêté **une seule fois
   au montage**.
2. **`SentierActivites`** → deux états React **séparés** par étape :
   `estVisible` (observateur) et `estOuvert` (clic). Le commentaire du code est
   explicite : « jamais remis à false : le clic ne touche jamais ce state ».
   Un bug historique venait de leur confusion.
3. **`useTraceAuScroll`** → mesure `getTotalLength()` une fois au montage et
   pilote `strokeDashoffset` au défilement.

### 1.10 Système de planning actuel

`Planning.js` lignes 22-54. Un tableau HTML, **groupé par moment de la journée**
(Matin / Midi / Soir) et non par heure. Le commentaire du code justifie ce
choix : « les horaires diffèrent d'un jour à l'autre (19h00 le mardi, 19h15 le
lundi), un tableau aligné à l'heure près obligerait à inventer des lignes
vides ».

`stages = []` — le bloc événements existe mais n'est jamais rendu.

---

## 2. Contenus à rendre éditables

| Bloc | Fichier · lignes | Cible Sanity |
|---|---|---|
| SEO global | `app/layout.js` 26-29 | `seoGlobal` |
| Hero — pastilles | `Hero.js` 4 | `siteContent.heroActivites` |
| Hero — titre | `Hero.js` 15-19 | `siteContent.heroTitre` |
| Hero — boutons | `Hero.js` 25-26 | `siteContent` (libellés seuls) |
| Hero — image de fond | `globals.css` 145 | `siteContent.heroImage` ⚠️ en CSS |
| Manifesto | `Manifesto.js` 9-12 | `siteContent.citationBandeau` |
| About — titre | `About.js` 25-30 | `siteContent.aProposTitre` |
| About — texte | `About.js` 31-39 | `siteContent.aProposTexte` |
| About — 5 puces | `About.js` 44-49 | `siteContent.aProposAvantages[]` |
| About — conclusion | `About.js` 55-62 | `siteContent.aProposConclusion` |
| About — photo, badge | `About.js` 20, 22-24 | `siteContent.aProposPhoto` |
| **Activités (8)** | `activitesData.js` 25-85 | **`activite`** |
| En-tête activités | `EnteteActivites.js` 18-24 | `siteContent.activitesTitre` |
| Outdoor | `Outdoor.js` 14-22, 40-52 | `siteContent.outdoor*` |
| Bespoke | `Bespoke.js` 8, 32-42 | `siteContent.bespoke*` |
| Coach | `Coach.js` 8-14, 31-58 | `siteContent.coach*` |
| Tarifs | `Pricing.js` 18-62 | `siteContent.tarifs*` |
| Étapes inscription | `Pricing.js` 76-88 | `siteContent.inscriptionEtapes[]` |
| **Planning** | `Planning.js` 22-54 | **`creneau` + `exception` + `fermeture`** |
| Stages | `Planning.js` 62 | **`evenement`** |
| Contact | `Contact.js` 5-34, 61-67, 80-84 | `infosPratiques` + `siteContent` |
| Réseaux sociaux | `Reseaux.js` 17-30 | `infosPratiques.reseauxSociaux[]` |
| Footer | `Footer.js` 35-38, 69-71 | `siteContent.footer*` |
| Coordonnées | `liens.js` 8-10, 23-36 | `infosPratiques` |
| Articles | **inexistants** | `article` (nouveau) |

### Ce qui NE doit jamais remonter dans le CMS

`globals.css` en entier hors la ligne 145 · l'ordre des sections dans
`app/page.js` (28-46) · l'alternance des fonds crème/rose · les classes
`.apparition*` et `.retard-*` · `buildPath()` (`SentierActivites.js` 18-30) ·
la mécanique du carrousel · les SVG inline · `build-standalone.js` ·
les libellés de navigation de `Nav.js` et `Footer.js` (structure).

---

## 3. Dépendances

### 3.1 État actuel

```
21 paquets · 475 Mo · package-lock.json commité
npm audit : 4 vulnérabilités HIGH, 0 critique
```

| Paquet | Problème | Origine |
|---|---|---|
| `next` 15.5.19 | 5 CVE : DoS Server Actions, SSRF, confusion de cache | direct |
| `postcss` | 4 CVE : XSS via `</style>`, traversée `sourceMappingURL` | transitif |
| `nanoid` | 2 CVE : boucle infinie | transitif |
| `sharp` < 0.35 | 4 CVE libvips | transitif |

Les quatre se corrigent par `next@15.5.23` (version de patch).

### 3.2 Compatibilité Sanity — contrainte majeure

Relevé sur le registre npm le 21 août 2026 :

| Paquet | Dernière version | Exige |
|---|---|---|
| `sanity@6` | 6.10.1 | **React ^19.2.2** |
| `sanity@5` | 5.31.2 | **React ^19.2.2** |
| `sanity@4` | 4.22.1 | React `^18 \|\| ^19` ✅ |
| `next-sanity@13` | 13.3.3 | **Next ^16**, React ^19.2.3 |
| `next-sanity@12` | 12.4.5 | **Next ^16**, React ^19.2.3 |
| `next-sanity@11` | 11.6.13 | Next `^15.1 \|\| ^16`, React `^18.3 \|\| ^19` ✅ |

> **Combinaison retenue : `next-sanity@11` + `sanity@4.22` + `@sanity/client@7`.**
> C'est la seule qui fonctionne sans imposer une montée en React 19 et Next 16,
> laquelle sortirait très largement du périmètre « ajouter un CMS sans casser
> ce qui fonctionne ».

Cette contrainte doit être réévaluée si le projet migre un jour vers Next 16.

---

## 4. Risques identifiés

### 4.1 Bloquant — `output: 'export'` interdit la prévisualisation

Le plan rend la prévisualisation obligatoire (Phase 7). Elle exige une route
serveur. Vérifié par expérience, dans une copie jetable du projet :

```
Error: export const dynamic = "force-static" not configured on route
       "/api/preview" with "output: export"
> Build error occurred
```

**`output: 'export'` et une route de preview sont mutuellement exclusifs.**

À noter : retirer `output: 'export'` ne rend pas le site dynamique. Next
hébergé sur un runtime Node génère tout de même l'intégralité du HTML au build
et le sert depuis un CDN. Le drapeau ne sert qu'à produire un dossier `out/`
portable, utilisé par `build-standalone.js`.

### 4.2 Élevé — trois ruptures d'animation au passage en dynamique

| # | Rupture | Effet | Mitigation |
|---|---|---|---|
| 1 | `key={act.name}` (`SentierActivites.js:195`, `CarrouselActivites.js:151`) | Renommer une activité dans Sanity change la clé React : l'étape est démontée et remontée avec `estVisible = false`, donc **invisible** pour un visiteur ayant déjà défilé | Clé = `_id` Sanity |
| 2 | `const SENTIER = buildPath(activities.length)` en portée module | Le tracé SVG est figé sur un tableau statique | Calcul dans le composant, mémoïsé |
| 3 | `useTraceAuScroll` avec `[pathRef, wrapRef]` | Refs stables → effet exécuté une seule fois ; si le chemin change, `strokeDasharray` reste périmé | Ajouter la longueur aux dépendances |

**Récupérer les données au build neutralise les ruptures 2 et 3** : rien ne
change après le montage. La rupture 1 reste à corriger explicitement.

### 4.3 Moyen — sécurité de l'existant

| Point | État |
|---|---|
| Secrets dans l'historique git | ✅ Aucun (8 021 lignes de diff analysées) |
| `.env` commité | ✅ Jamais, sur toutes les branches |
| `.gitignore` | ⚠️ Ne couvre pas `.env` ni `.env.production` |
| `.env.example` | ❌ Absent |
| En-têtes de sécurité | ❌ Aucun — le site n'est pas hébergé |
| `dangerouslySetInnerHTML` | ✅ Aucune occurrence |

### 4.4 Moyen — le pipeline de livraison hors-ligne

`build-standalone.js`, `serve.js` et `Livraison-MGYM/` dépendent de `out/`,
donc de `output: 'export'`. Retirer ce drapeau les casse.

Trois options, la troisième recommandée :

1. Retirer le pipeline (~450 lignes) — sa fonction est reprise par la preview
2. Le conserver via un second mode de build — la route de preview devrait en
   être exclue, ce que Next ne permet pas nativement
3. **Bâtir l'export dans une copie temporaire du projet privée de `app/api/`** —
   préserve la fonctionnalité, découple du mode de rendu

---

## 5. Contraintes du projet à respecter

Issues de `CLAUDE.md`, documentation interne du dépôt :

1. **Français partout** : variables, commentaires, classes CSS métier.
2. **Commentaires pédagogiques** — la personne qui reprend le code n'est pas
   développeuse.
3. **Composants serveur par défaut** ; `'use client'` justifié en commentaire.
4. **Aucun `style={{ }}` dans le JSX**, aucune couleur en dur.
5. **Lisibilité : jamais sous `.85rem`** pour du texte courant. Contrainte
   cliente, pas préférence.
6. **Alternance des fonds** crème / rose entre sections.
7. Deux lignes de `CLAUDE.md` devront être **amendées** : l'interdiction de
   TypeScript et la règle des trois dépendances, que le plan remplace par
   « aucune dépendance inutile ».

---

## 6. Architecture cible

```
                        SANITY
                          |
              +-----------+-----------+
              |                       |
          PUBLISHED                 DRAFT
              |                       |
              v                       v
      client "published"      client "previewDrafts"
              |                       |
              v                       v
        DATA LAYER  ..............  DATA LAYER
        /lib/sanity  (une seule instance par usage)
              |                       |
              v                       v
      Rendu statique au build   Rendu dynamique
      (contenu publié)          (draftMode activé,
              |                  secret vérifié, expirable)
              v                       v
        PRODUCTION                 PREVIEW
        site public               URL privée + bandeau
```

Publication :

```
CLIENTE -> modification -> brouillon Sanity -> preview
        -> validation humaine -> PUBLIER -> Deploy Hook -> production
```

Le **Deploy Hook de l'hébergeur** est préféré à un webhook maison : aucune API
publique à écrire, donc aucune signature à vérifier ni limitation de débit à
implémenter. La surface d'attaque disparaît par construction.

### Arborescence prévue

```
sanity.config.js          configuration du Studio
sanity/
  schemaTypes/            un fichier par modèle
  lib/                    utilitaires du Studio (previews, structure)
lib/sanity/
  client.js               clients published / preview
  image.js                URLs d'images avec hotspot
  queries/                requêtes GROQ, jamais dans un composant
  planning.js             moteur de calcul, pur
app/
  api/preview/route.js    entrée du mode preview
  api/preview-exit/route.js
  studio/[[...index]]/    Studio embarqué (option) ou déploiement séparé
scripts/
  migrate.js              import du contenu existant
```

---

## 7. Recommandations

| # | Recommandation | Justification |
|---|---|---|
| 1 | **Corriger `next` en 15.5.23 avant tout ajout** | Installer Sanity sur une base vulnérable revient à empiler la dette |
| 2 | **Retirer `output: 'export'` du build par défaut** | Seule façon d'avoir la prévisualisation exigée par le plan |
| 3 | **`next-sanity@11` + `sanity@4.22`** | Seule combinaison compatible React 18 / Next 15 |
| 4 | **JavaScript + JSDoc**, pas de migration TypeScript | Conforme au §11 du plan et à `CLAUDE.md` |
| 5 | **Conserver le rendu Matin / Midi / Soir** | Le modèle `creneau` vit derrière, le regroupement se fait à l'affichage |
| 6 | **Clé React = `_id` Sanity** | Empêche le retour du bug d'animation documenté |
| 7 | **Données récupérées au build**, jamais en `useEffect` | Protège les animations, le SEO et évite le flash |
| 8 | **Deploy Hook plutôt que webhook maison** | Supprime une API publique à sécuriser |
| 9 | Compléter `.gitignore` (`.env`, `.env.production`) et créer `.env.example` | Avant d'introduire le moindre token |

---

## 8. Questions bloquantes

Ces trois réponses conditionnent des travaux qui ne peuvent pas être devinés.

| # | Question | Ce qui est bloqué |
|---|---|---|
| **1** | **Identifiants Sanity** : projet à créer, ou projet existant ? `sanity login` est interactif et ne peut pas être exécuté ici. Il faut `SANITY_PROJECT_ID`, un dataset, un token de lecture. | Phases 6, 8 et 15 : historique réel, publication réelle, tests de bout en bout |
| **2** | **Le site Next remplace-t-il `mgym.fr` ?** La cliente perdrait son éditeur Hostinger — c'est le but, mais elle doit l'avoir accepté. Le DNS devra être repointé. | Phase 8 : configuration du déploiement, CORS, domaine du Studio |
| **3** | **Pipeline de livraison hors-ligne : option 1, 2 ou 3 ?** | Le sort de `build-standalone.js` et `serve.js` |

**Tout ce qui ne dépend pas de ces réponses est réalisable et testable
immédiatement** : schémas, couche de données, moteur de planning et ses tests,
script de migration, routes de preview, durcissement sécurité, documentation.

---

## 9. Méthode de vérification

Chaque affirmation de ce document repose sur une observation directe :

- lecture intégrale des 21 fichiers source, de `globals.css`, des scripts de
  build et de `CLAUDE.md` ;
- numéros de ligne relevés par recherche automatisée puis vérifiés à la main ;
- `npm audit` sur l'arbre installé, `npm view` sur le registre pour les
  compatibilités Sanity ;
- historique git complet, toutes branches, binaires et bundles exclus ;
- résolution DNS, requêtes HTTP et RDAP AFNIC sur les trois domaines ;
- test de compatibilité `output: 'export'` exécuté dans une copie jetable,
  supprimée après usage.
