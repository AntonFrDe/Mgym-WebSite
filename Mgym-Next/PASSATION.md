# Passation — site M'GYM

> À coller (ou faire lire) au début d'une nouvelle conversation Claude.
> Mis à jour le **7 octobre 2026**. **Le dépôt est public : aucun secret ici.**
> Les conventions du code sont dans `Mgym-Next/CLAUDE.md` — à lire aussi.

---

## En une phrase

Site vitrine Next.js 15 d'une association sport-santé de Mirepoix-sur-Tarn,
alimenté par Sanity, hébergé chez Netlify sur `mgym.fr`. **La dernière
version est sur `main` mais PAS en ligne** : l'équipe Netlify qui héberge
le site n'a plus de crédits, et la migration vers un autre compte est à
moitié faite (voir « Priorité 1 »).

---

## Démarrer une nouvelle conversation

Message à envoyer à Claude :

> Lis `Mgym-Next/PASSATION.md` puis `Mgym-Next/CLAUDE.md`. Vérifie l'état
> réel (git, `netlify status`, `curl -I https://mgym.fr`) avant d'agir :
> ce document peut avoir vieilli. Puis reprends à la « Priorité 1 ».

Le projet est dans `Mgym-Next/`, **pas à la racine du dépôt**. `netlify.toml`
est à la racine et déclare `base = "Mgym-Next"`.

---

## Les adresses

| Quoi | Où |
|---|---|
| Site en ligne | <https://mgym.fr> — sert encore la version du **27/09** |
| Ancien projet Netlify | `frolicking-babka-da04a6` — équipe « Antoteam » |
| Nouveau projet Netlify | `mgym-site` (id `e84ea511-d2c9-45bd-b75f-a990a32a6d8b`) — équipe « Anton » — **502, pas encore relié à GitHub** |
| Back-office | <https://mgym.sanity.studio> |
| Dépôt | `github.com/AntonFrDe/Mgym-WebSite` — **public** |
| Projet Sanity | `zqxwi6qy`, dataset `production` |
| DNS | zone chez **OVH** (migration faite) : `@ A 75.2.60.5`, `www CNAME frolicking-babka-da04a6.netlify.app.`, MX OVH inchangés |

---

## Les comptes

| Service | Compte | Remarque |
|---|---|---|
| Netlify — équipe **Antoteam** (ancien projet) | `anton.franc-delbourg@epitech.eu` | Propriétaire. **Crédits épuisés jusqu'au 13/10/2026** |
| Netlify — équipe **Anton** (nouveau projet) | `antonfd8@gmail.com` | 300 crédits neufs |
| GitHub | `AntonFrDe` | `gh` connecté sur la machine |
| Sanity | CLI déjà connectée (`npx sanity …` marche) | |

Le CLI Netlify (`netlify`, v27) est installé et connaît **les deux** comptes.
Le compte actif est `antonfd8@gmail.com`. Pour changer : `netlify switch`.
Toute connexion (`netlify login`) est interactive : demander à l'utilisateur
de taper `! netlify login` dans le prompt.

---

## Priorité 1 — remettre le site à jour en ligne

### Pourquoi c'est bloqué

Chaque déploiement de **production** coûte 15 crédits sur 300 par mois
(offre gratuite). L'équipe Antoteam les a épuisés en septembre : chaque
commit sur `main` (même de la doc) et chaque « Publier » de la cliente
(webhook Sanity) relançait un build. Depuis le 28/09, Netlify répond
« **Skipped due to account credit usage exceeded** » : les merges des PR
#1, #2 et #3 n'ont jamais été publiés. Les aperçus de PR, eux, se
construisent (ils ne coûtent rien) — d'où la confusion.

Déjà corrigé pour l'avenir : le webhook Sanity est **supprimé** (le site
relit Sanity toutes les 60 s, il était inutile) et `netlify.toml` contient
une règle `ignore` : un commit qui ne touche que des `.md` ou `docs/` ne
déclenche plus de build.

### Choix de l'utilisateur : nouveau projet sur le compte « Anton »

Fait :
- projet `mgym-site` créé ; variables `SANITY_API_READ_TOKEN` (nouveau
  jeton Sanity « Netlify – site (compte Anton, 2026-10-06) », rôle Viewer)
  et `SANITY_PREVIEW_SECRET` (nouveau, 64 caractères) posées en secret pour
  production, deploy-preview et branch-deploy ;
- protection « Team login » retirée (`sso_login: false`), sinon le site
  répond « This site is private ».

**Reste, dans l'ordre :**
1. **L'utilisateur** relie le projet à GitHub (interactif) :
   <https://app.netlify.com/projects/mgym-site/configuration/deploys> →
   *Link repository* → GitHub → `AntonFrDe/Mgym-WebSite` → branche `main`.
   Netlify lit `netlify.toml` tout seul.
2. Attendre le build serveur, vérifier `https://mgym-site.netlify.app` :
   HTTP 200 sur `/`, `/blog`, `/evenements/tai-chi-chuan-and-qi-gong`,
   « Appeler pour un essai » dans le HTML, ~40 occurrences de
   `cdn.sanity.io`, `/api/draft-mode/enable` en **401** (pas 404),
   `/_next/image?...` en **404**.
3. Déplacer le domaine : avec le compte epitech, retirer `mgym.fr` de
   `frolicking-babka-da04a6` (`custom_domain: null`) ; avec le compte
   gmail, l'ajouter à `mgym-site` (`custom_domain: "mgym.fr"`, alias
   `www.mgym.fr`). L'enregistrement A pointe déjà vers Netlify : rien à
   changer pour `@`. Demander à l'utilisateur de remplacer chez OVH le
   CNAME `www` par `mgym-site.netlify.app.`. Attendre le certificat.
4. Vérifier `https://mgym.fr`, puis l'**Aperçu** du Studio (il dépend de
   `/api/draft-mode/enable`, absent de la version en ligne actuelle).
5. Ensuite seulement : révoquer l'ancien jeton Sanity `mgym-viewer`
   (`npx sanity tokens list` / `delete`), et laisser l'ancien projet
   s'éteindre.

> Alternative si la migration coince : le 13/10, les crédits d'Antoteam
> reviennent ; `netlify switch` (compte epitech) puis
> `netlify api createSiteBuild --data '{"site_id":"94821dd5-2efc-4a66-8044-b6b4fa08e3af"}'`.

### Ne pas refaire ce qui a échoué

**Déployer depuis la machine** (`netlify deploy --build`) a échoué trois
fois, ne pas réessayer :
- le CLI en local résout `publish = ".next"` depuis la racine du dépôt et
  non depuis `Mgym-Next/` (« publish directory was not found ») ;
- en contournant (`publish = "Mgym-Next/.next"`), le déploiement réussit
  mais la fonction serveur plante : `ENOENT … '/run-config.json'` (502) ;
- un `node_modules` en lien symbolique donne une fonction sans Next
  (`Cannot find module 'next/dist/server/lib/start-server.js'`).

Les serveurs Netlify construisent ce dépôt correctement (les aperçus de PR
le prouvent) : passer par GitHub.

---

## Priorité 2 — confidentialité

- **Photos d'adhérentes** (`Mgym-Next/new pic/`, 14 PNG, 21 Mo) : retirées
  du suivi git et ignorées le 7/10 (elles restent sur le disque). **Elles
  sont encore dans l'historique d'un dépôt PUBLIC.** Décision de
  l'utilisateur : passer le dépôt en privé (le plus simple), ou purger avec
  `git filter-repo --path "Mgym-Next/new pic" --invert-paths` + push forcé
  (réécrit l'historique de tout le monde).
- Jeton Sanity **`mgym-editor`** (rôle Editor = écriture) : encore actif.
  Il servait aux tests `verifier:workflow` ; à supprimer s'il ne sert plus.
- Aucun jeton n'est dans `Mgym-Next/.env.local` (seulement les 5 variables
  publiques). `SANITY_PREVIEW_SECRET` local : absent, l'aperçu local renvoie
  503 — c'est voulu.

---

## Priorité 3 — Studio

1. `npm run studio:deploy` (depuis `Mgym-Next/`) : le Studio en ligne n'a
   peut-être pas les derniers changements (actions réparées, descriptions
   nettoyées, champs PDF).
2. Tester **dans le Studio** (personne ne l'a fait) :
   - un créneau → ⋯ → **Annuler une date** → une « exception » doit
     apparaître dans « Annulations & changements » ;
   - un événement → ⋯ → **Dupliquer** → un brouillon « … (copie) » sans
     adresse web.
   Ces deux actions ne faisaient RIEN avant le 6/10 (`props.getClient`
   n'existe pas) ; elles passent maintenant par `useClient`.

---

## Contenu à demander à la cliente (rien à coder)

- **Photos réelles** de la salle des fêtes et d'adhérentes de tous âges :
  le haut de page est une photo de banque d'images, l'image des Ateliers
  une illustration IA (gratte-ciel). Premier facteur « générique » du site.
- Bande du haut de page (`heroActivites`) : retirer « **Blog** » et
  « Renforcement Musculaire » (n'existent nulle part ailleurs).
- PDF **Règlement intérieur** et **Conditions générales** à déposer dans
  *Infos pratiques* : le formulaire d'inscription les exige, le site les
  propose dès qu'ils existent.
- **Témoignages** : aucun dans Sanity (le site affiche le seul avis du
  code). Uniquement de vrais avis, avec accord.
- **Fiche Google « M'Gym »** : marquée « **Définitivement fermé** », adresse
  « Rue du Coutal ». À corriger par la cliente dans Google Business Profile.
  La vraie salle : salle des fêtes, Route de Layrac (le repère de carte du
  site y est depuis le 2/10).
- Questions jamais tranchées : la **saison** (« 2025—2026 » sur le site,
  « ADHESION 26/27 » sur le formulaire) ; le **tarif famille** (410 € contre
  2 × 215 €).

---

## Ce qui a été fait (depuis le 26/09)

| Commit | Contenu |
|---|---|
| a6b00b9 | Version téléphone, onglets « Plus d'activités », frise des événements, aperçu du Studio |
| c0e868f | Retours cliente lot 2 (plaquettes, carte sur la salle des fêtes, coach, témoignages, photos d'événements, libellés modifiables) + audit « généré par IA » (étiquettes redondantes, contrastes, lisibilité, CGV/règlement, « Appeler pour un essai ») + Next 15.5.27 (faille critique) |
| 818b3f0 | Actions du Studio réparées, pannes Sanity visibles en prod, `images.unoptimized`, 62 descriptions « Actuellement « … » » retirées |
| e9a094e | `netlify.toml` : pas de build pour un commit de doc |

État : 103 tests, schémas et requêtes valides, build vert. Décisions de
design : `Vault/30-Decisions/adr-006-mgym-elements-generes-par-ia.md`.

---

## Améliorations repérées, non faites

Par ordre d'intérêt (détail : critique dans `Mgym-Next/.impeccable/`, non
versionnée) :
- **Deux systèmes d'aperçu** (`/api/preview?secret=` et
  `/api/draft-mode/*`) + un jeton HMAC maison (`lib/preview-jeton.js`)
  par-dessus le cookie de Next. Garder draft-mode seul.
- Code mort en production : variante « sentier » et copie hors-ligne
  (`build-standalone.js`, `export-statique.mjs`, `localiser-images.mjs`,
  ~740 lignes qui réécrivent chaque interaction en JS vanilla). À retirer
  maintenant que le site est en ligne — sinon toute modif est à faire deux fois.
- CSS : 16 rayons et 25 ombres différents → 3 rayons, 2 ombres en variables.
- Sections maigres : Témoignages (1 avis) et Réseaux (2 liens) ; nav à 9 entrées.
- Documentation pléthorique (~3 100 lignes) : supprimer les audits
  (`docs/AUDIT-*`, `FINAL-BACKEND-AUDIT.md`) qui affirment « 21/21 » sans
  avoir testé le Studio ; `docs/DEPLOIEMENT.md` est périmé.
- Scripts obsolètes : `scripts/heberger-tour.sh`, `adresse-tour.sh`,
  `arreter-tour.sh` (tunnel, remplacé par Netlify), `migrer.mjs` (fait).
- Textes génériques de la cliente (« Formes & Bien-être », triades
  d'impératifs) : à proposer, l'utilisateur a choisi « code seulement ».

---

## Les pièges — la partie la plus utile

### Netlify
- **Les crédits** : 15 par déploiement de production, 300/mois en gratuit.
  Ne jamais rebrancher un webhook Sanity → build.
- **Les aperçus de PR sont protégés** (HTTP 401) : impossible de les tester
  par `curl`. Le statut GitHub « Deploy Preview ready » prouve seulement
  que le build passe.
- **`publish` et `[[plugins]]` doivent rester explicites** dans
  `netlify.toml`, sinon « 0 new function(s) » : pas de route serveur.
- **Variables publiques Sanity dans `netlify.toml`** : une variable saisie
  dans l'interface peut avoir une portée qui exclut le build.
- **Le domaine** ne peut être que sur un seul projet à la fois.

### Build et données
- **Une panne Sanity fait maintenant échouer le build** en production
  (`lib/sanity/fetch.js` relance l'erreur) : c'est voulu, Netlify garde la
  version précédente. Ne pas « réparer » en revenant au repli silencieux.
- **Une liste Sanity remplace la liste par défaut en entier** (`fusionner`,
  `lib/contenu/index.js`) : Instagram, ajouté au code, est resté invisible
  tant que Sanity ne contenait que Facebook. Vérifier ce qu'il y a dans
  Sanity (requête publique sur `zqxwi6qy.apicdn.sanity.io`) avant de dire
  « c'est fait ».
- **Le cache de données de Next survit aux builds** : ne pas retirer le
  `prebuild` (`scripts/vider-cache-donnees.mjs`).
- **`MGYM_HSTS=1` reste opt-in** (Netlify envoie déjà son propre HSTS).

### Sanity
- **Forfait gratuit : rôles Administrator et Viewer seulement.** La
  protection du contenu, c'est `npm run sauvegarde` (dernière sauvegarde :
  `../../Sauvegardes-MGYM/mgym-production-2026-10-02.tar.gz`).
- **Actions du Studio : `useClient`, jamais `props.getClient`** (n'existe
  pas — l'erreur est silencieuse).
- **Stega** : tout champ COMPARÉ par le code va dans `CHAMPS_SANS_STEGA`.
- **Après chaque changement de schéma : `npm run studio:deploy`.**

### Outillage
- **Node 20.19 minimum** (Node 22 actif via nvm).
- **`pkill -f "next start"` se tue lui-même** : utiliser `[n]ext start`,
  ou tuer par port (`ss -ltnp`).
- **Ne pas lancer `next build` dans `Mgym-Next/` pendant que l'utilisateur
  a un `next dev`** : ils partagent `.next/`. Construire dans une copie.
- **`.gitignore` écrit avec `printf` et des apostrophes françaises** :
  la ligne a été coupée et `git add -A` a recommité les photos qu'on venait
  de retirer. Écrire ces fichiers avec un éditeur, puis vérifier avec
  `git check-ignore -v <fichier>`.
- La fusion vers `main` est bloquée par le garde-fou de Claude Code sauf
  demande explicite de l'utilisateur (« merge avec le main »).
