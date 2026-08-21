# Site M'GYM — Bien-être & Santé

Site vitrine d'une seule page pour l'association **M'GYM**, à
Mirepoix-sur-Tarn, avec un back-office Sanity permettant à la cliente de
modifier tout le contenu sans toucher au code.

Public visé : adhérentes et adhérents adultes, souvent seniors — la
lisibilité prime sur l'effet technique.

| Document | Pour qui |
|---|---|
| Ce fichier | développeur : installer, lancer, déployer |
| [docs/GUIDE-CLIENTE.md](docs/GUIDE-CLIENTE.md) | la cliente : modifier son site |
| [docs/SECURITY.md](docs/SECURITY.md) | 12 points de sécurité, vérifiés |
| [docs/ROLLBACK.md](docs/ROLLBACK.md) | restaurer une version précédente |
| [docs/SANITY-SCHEMAS.md](docs/SANITY-SCHEMAS.md) | les modèles de contenu |
| [docs/AUDIT-BACKEND.md](docs/AUDIT-BACKEND.md) | l'état des lieux d'origine |
| [CLAUDE.md](CLAUDE.md) | conventions du code et pièges connus |

---

## Prérequis

**Node 20.19 minimum** — tous les paquets Sanity l'exigent, y compris
`@sanity/client`. La version attendue est dans `.nvmrc` (22.23.2).

```bash
node -v          # doit afficher v20.19+ ou v22.12+
```

Sur une machine restée en Node 18, le CLI Sanity échoue avec un
`ERR_REQUIRE_ESM` peu parlant. Le vrai motif est la version de Node.

---

## Installation

```bash
npm install
cp .env.example .env.local     # puis remplir les valeurs
```

### Variables d'environnement

| Variable | Secret ? | À quoi ça sert |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | non | identifiant du projet, visible dans l'URL de l'API |
| `NEXT_PUBLIC_SANITY_DATASET` | non | `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | non | date figée, à ne pas faire avancer sans raison |
| `SANITY_STUDIO_PROJECT_ID` | non | même valeur que la première — le CLI Sanity et Next n'injectent pas les mêmes préfixes |
| `SANITY_STUDIO_DATASET` | non | idem |
| `SANITY_API_READ_TOKEN` | **oui** | lecture des brouillons en prévisualisation. Rôle **Viewer** |
| `SANITY_PREVIEW_SECRET` | **oui** | protège l'entrée du mode prévisualisation. 32 octets minimum |
| `SANITY_API_WRITE_TOKEN` | **oui** | **usage local exclusivement** — script de migration. À ne JAMAIS configurer sur l'hébergeur |

Générer un secret de prévisualisation :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> **Le site n'écrit jamais dans Sanity.** Aucun token d'écriture ne doit
> exister sur l'hébergeur. Voir [docs/SECURITY.md](docs/SECURITY.md).

**Le site fonctionne sans Sanity configuré** : il affiche alors le contenu par
défaut (`lib/contenu/defaut.js`), c'est-à-dire le site tel qu'il était avant
l'ajout du CMS. Ce n'est pas une panne, c'est l'état initial.

---

## Développement

```bash
npm run dev            # le site,   http://localhost:3000
npm run studio:dev     # le Studio, http://localhost:3333
```

---

## Vérifier

```bash
npm run verifier       # enchaîne les quatre commandes ci-dessous
```

| Commande | Ce qu'elle contrôle |
|---|---|
| `npm run schemas:check` | les schémas compilent, chaque document a un aperçu lisible, chaque champ une description française |
| `npm run groq:check` | les 13 requêtes compilent, aucune valeur variable n'est concaténée, aucune ne vise `drafts.` |
| `npm test` | 67 tests : moteur de planning, sécurité de la prévisualisation, idempotence de la migration, cohérence schéma / requête / contenu |
| `npm run build` | le site se construit |

Il n'y a **pas de linter** dans ce projet : `npm run verifier` en tient lieu.

---

## Migrer le contenu existant

```bash
npm run migrer          # simulation, n'écrit rien
npm run migrer:ecrire   # applique
```

Le script est **idempotent** : chaque document a un identifiant déduit de son
contenu, une seconde exécution remplace au lieu de dupliquer.

---

## Prévisualisation

```
/api/preview?secret=LE_SECRET&chemin=/     ouvre une session d'une heure
/api/preview-exit                           la ferme
```

Une session vérifie le secret **et** une date limite signée. Un cookie
modifié à la main est refusé, un secret faux renvoie exactement le même
message qu'un secret absent.

---

## Publier en production

```
La cliente clique « Publier » dans le Studio
        ↓
Sanity appelle le Deploy Hook de l'hébergeur
        ↓
Le site se reconstruit (~1 à 2 min) et repart sur le CDN
```

**Aucune API de revalidation n'a été écrite** : le Deploy Hook de l'hébergeur
suffit et évite d'exposer une route publique à sécuriser.

> ⚠️ Reste à faire : créer le projet Sanity, choisir l'hébergeur, et brancher
> le Deploy Hook. Voir la fin de [docs/SECURITY.md](docs/SECURITY.md).

---

## Livrer une copie hors-ligne

Le site peut aussi être remis sous forme de fichiers qui s'ouvrent par
double-clic, sans serveur ni Internet.

```bash
npm run livraison       # dossier Livraison-MGYM/ (~1,3 Mo)
npm run build:html:all  # deux fichiers .html autonomes (~1,6 Mo)
```

`scripts/export-statique.mjs` recopie le projet dans un dossier temporaire
**sans `app/api/`**, y lance un build en mode export, et rapatrie `out/`. Le
projet réel n'est jamais modifié : rien à réparer si le build échoue.

C'est nécessaire parce que `output: 'export'` interdit toute route serveur, et
que la prévisualisation en exige une. Les deux ne peuvent pas coexister dans
une même configuration — vérifié par un build, pas supposé.

---

## Déploiement

Le site n'est **pas encore hébergé**. Il lui faut un runtime Node (Vercel,
Netlify, Cloudflare Pages) : les pages restent générées au build et servies
par un CDN, seules les deux routes de prévisualisation sont dynamiques.

```
Variables à configurer chez l'hébergeur :
  NEXT_PUBLIC_SANITY_PROJECT_ID
  NEXT_PUBLIC_SANITY_DATASET
  NEXT_PUBLIC_SANITY_API_VERSION
  SANITY_API_READ_TOKEN        (Viewer)
  SANITY_PREVIEW_SECRET

À NE PAS configurer :
  SANITY_API_WRITE_TOKEN       le site n'écrit jamais
```

Le Studio se déploie séparément :

```bash
npm run studio:deploy   # puis brancher admin.mgym.fr
```

---

## Dépannage

| Symptôme | Cause probable |
|---|---|
| `ERR_REQUIRE_ESM` sur une commande `sanity` | Node < 20.19 — voir `.nvmrc` |
| Le site affiche l'ancien contenu | Sanity non configuré : c'est le repli, il fonctionne |
| Une section a disparu | Champ vidé dans le CMS **et** absent du contenu par défaut |
| `npm run build` échoue sur `/api/preview` | `MGYM_EXPORT=1` est actif : les routes serveur sont incompatibles avec l'export |
| La prévisualisation montre le contenu publié | `SANITY_API_READ_TOKEN` absent — repli volontaire, avertissement dans les journaux |
| Le planning est vide | Aucun créneau saisi **et** repli désactivé |

---

## Architecture

```
app/
  layout.js            metadata dynamiques, bandeau de prévisualisation
  page.js              récupère le contenu UNE fois et le distribue
  api/preview/         entrée du mode prévisualisation
  api/preview-exit/    sortie
  sitemap.js robots.js générés depuis le contenu
  globals.css          100 % du style, organisé par section
components/            des afficheurs : ils reçoivent des props, rien d'autre
lib/
  contenu/             fusion CMS + contenu par défaut  ← le point d'entrée
  sanity/              clients, requêtes GROQ, images
  planning/            moteur de calcul (pur) et grille d'affichage
  preview.js           session de prévisualisation
  preview-jeton.js     sa cryptographie, isolée pour être testable
sanity/                schémas et structure du back-office
scripts/               migration, export hors-ligne, vérifications
```

**Aucun composant n'appelle Sanity.** Ils reçoivent des données déjà prêtes et
ignorent d'où elles viennent. Cette séparation est ce qui permet au site de
fonctionner sans CMS, et aux composants d'être lus par une personne qui ne
connaît pas Sanity.
