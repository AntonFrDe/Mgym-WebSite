# Passation — site M'GYM

> À coller au début d'une nouvelle conversation pour reprendre le travail.
> Écrit le 26 septembre 2026. **Le dépôt est public : aucun secret ici.**

---

## En une phrase

Site vitrine Next.js d'une association de Mirepoix-sur-Tarn, alimenté par
Sanity, en ligne sur Netlify. Il reste à le mettre sur `mgym.fr` et à
remettre les clés à la cliente.

---

## Les adresses

| Quoi | Où |
|---|---|
| Site en production | <https://frolicking-babka-da04a6.netlify.app> |
| Back-office | <https://mgym.sanity.studio> |
| Dépôt | `github.com/AntonFrDe/Mgym-WebSite` — **public** |
| Projet Sanity | `zqxwi6qy`, dataset `production`, workspace `mgym` |
| Domaine visé | `mgym.fr` — sert encore l'ancien site Hostinger |

Le projet n'est **pas à la racine du dépôt** : il est dans `Mgym-Next/`.
C'est la cause de plusieurs échecs de build ; `netlify.toml`, **à la racine
du dépôt et non dans `Mgym-Next/`**, le déclare avec `base = "Mgym-Next"`.

---

## Où sont les secrets

Aucun n'est dans le dépôt, et aucun ne doit y entrer.

| Secret | Où le lire |
|---|---|
| `SANITY_API_READ_TOKEN` | `Mgym-Next/.env.local` et interface Netlify |
| `SANITY_PREVIEW_SECRET` | idem |
| `SANITY_API_WRITE_TOKEN` | `.env.local` uniquement — **jamais** chez l'hébergeur |
| URL du Build hook Netlify | interface Netlify, *Build & deploy → Build hooks* |

> ⚠️ **À régénérer avant la mise en service.** Les deux jetons Sanity et
> l'URL du Build hook ont circulé en clair dans la conversation qui a
> produit ce document.

Les trois identifiants **publics** de Sanity (`projectId`, `dataset`,
`apiVersion`) sont volontairement dans `netlify.toml` — voir « Pièges ».

---

## État au 26 septembre 2026

```
61 commits · main == REFONTE-3 · arbre propre
71 tests · schémas valides · requêtes valides · build vert
production : HTTP 200, 34 images venant du CMS, 0 brouillon dans le HTML
```

**Fait :** Studio déployé · 21 documents migrés · Netlify en ligne ·
webhook de publication validé (deux livraisons HTTP 200) · première
sauvegarde du dataset vérifiée.

**Reste :** le domaine · le compte de la cliente · la remise.

---

## La prochaine manipulation : `mgym.fr` — décidé : zone DNS chez OVH

Le site reste chez Netlify. On rapatrie la **zone DNS** chez OVH, où le
domaine est déjà acheté (registrar OVH, expiration 29/06/2027). Ainsi,
Hostinger pourra être résilié sans rien casser : tant que la zone y vit,
résilier Hostinger coupe à la fois le site ET la messagerie.

### Inventaire de la zone Hostinger (mesuré le 26/09/2026)

| Nom | Type | Valeur | Sort |
|---|---|---|---|
| `@` | A | `193.58.105.88`, `147.79.119.52` (tournent) | → `75.2.60.5` |
| `@` | AAAA | 2 adresses `2a02:4780:…` | **supprimées** (Netlify n'en veut pas) |
| `www` | CNAME | `www.mgym.fr.cdn.hstgr.net` | → `frolicking-babka-da04a6.netlify.app.` |
| `@` | MX | `1 mx4.mail.ovh.net`, `10 mx3.mail.ovh.net` | **recopiés à l'identique** |
| `@` | TXT | `"1\|www.mgym.fr"` | supprimé (marqueur du CDN Hostinger) |

Rien d'autre : pas de joker, pas de SPF, DKIM, DMARC, CAA ni `mail.`/`ftp.`
(sondés un par un — un transfert de zone n'est pas possible).

### Les cinq étapes, dans cet ordre

1. **Netlify** — *Domain management → Add a domain* → `mgym.fr` (principal),
   `www.mgym.fr` s'ajoute avec. Refuser « Netlify DNS ». État : « awaiting DNS ».
2. **OVH** — *Web Cloud → Noms de domaine → mgym.fr → Zone DNS*. Si aucune
   zone n'existe, la créer (sans « enregistrements minimaux »). Puis faire
   correspondre la zone EXACTEMENT au tableau ci-dessus, colonne « Sort » :
   supprimer les A/AAAA/CNAME/TXT par défaut d'OVH, vérifier les deux MX
   (priorités 1 et 10). Rien ne change encore pour personne.
3. **Vérifier la zone OVH avant de basculer** : je l'interroge directement
   sur les serveurs OVH. On ne passe à 4 que si tout correspond.
4. **OVH** — onglet *Serveurs DNS* → *Modifier* → mettre les serveurs OVH
   affichés dans l'onglet Zone DNS (`dnsXX.ovh.net` / `nsXX.ovh.net`).
   Propagation jusqu'à 24–48 h ; pendant ce temps, les deux zones répondent
   avec les MES MX : la messagerie ne s'interrompt pas, le site alterne
   entre l'ancien et le nouveau.
5. **Attendre** le certificat Let's Encrypt de Netlify, **puis seulement**
   poser `MGYM_HSTS=1` dans Netlify et redéployer.

> ⚠️ L'étape 4 remplace le site actuel de la cliente. Son accord d'abord.
> Et **ne pas résilier Hostinger** avant que `mgym.fr NS` réponde OVH
> partout.

## Ce qu'il reste ensuite

- **Compte Sanity de l'association.** Décision prise : un compte dédié
  (adresse de l'association), pas le compte personnel partagé — pour que
  l'historique dise qui a modifié quoi. Rôle : voir le piège Sanity.
- **Les 21 contrôles en production** : `node scripts/tester-workflow.mjs <url>`.
  Exige un jeton **Editor** temporaire, à supprimer juste après.
- **Sortir `new pic/` du dépôt** — 21 Mo de photos d'adhérentes en pleine
  résolution, dans un dépôt public.
- **Remise à la cliente** : `docs/GUIDE-CLIENTE.md`, la vidéo
  (`docs/SCRIPT-VIDEO.md`), et chronométrer avec elle sur son téléphone
  quatre parcours — modifier un tarif, ajouter un créneau, changer une
  photo, publier un article.

### Deux questions de contenu jamais tranchées

- **La saison.** Le site annonce « Saison 2025 — 2026 », le formulaire
  d'inscription s'intitule « ADHESION 26/27 ». L'un des deux est périmé.
- **Le tarif famille.** 410 € pour deux personnes, contre 2 × 215 € = 430 €
  en individuel. L'écart de 20 € est-il voulu ?

---

## Les pièges — la partie la plus utile de ce document

Chacun a coûté du temps. Tous sont corrigés, mais un changement maladroit
peut les rouvrir.

### Outillage

- **Node 20.19 minimum.** Le Node du système est en 18 ; un Node 22 est
  installé dans `~/.local/node22/bin`. Sous Node 18, le CLI Sanity échoue
  sur un `ERR_REQUIRE_ESM` qui ne mentionne jamais la version.
- **`pkill -f "next start"` se tue lui-même** : le motif figure dans sa
  propre ligne de commande. Utiliser `[n]ext-server`, ou chercher par port.
- **`npm start`** sert le site hébergé ; **`npm run start:horsligne`** sert
  la copie hors-ligne. Les confondre donne un dossier introuvable.

### Build et hébergement

- **Le cache de données de Next survit aux builds.** Pendant `next build`,
  une entrée existante est réutilisée quel que soit son âge — ni le temps
  ni un `revalidate` ne l'expirent. C'est ce qui aurait rendu « Publier »
  sans effet. `scripts/vider-cache-donnees.mjs` (script `prebuild`) vide le
  seul `fetch-cache` à chaque build. **Ne pas le retirer.**
- **Netlify ne lance pas son adaptateur Next sans `publish` et
  `[[plugins]]` explicites.** Sans eux : « 0 new function(s) », donc aucune
  route serveur, donc pas de prévisualisation.
- **Une variable saisie dans l'interface Netlify peut avoir une portée qui
  exclut le build.** Le site se construit alors sans CMS et sert son
  contenu de secours — sans la moindre erreur. C'est pourquoi les trois
  identifiants publics sont dans `netlify.toml`.
- **Le repli masque les pannes.** Sans Sanity configuré, le site affiche
  `lib/contenu/defaut.js`, identique à l'original. Il a l'air parfait.
  Le test qui tranche : `curl -s <url> | grep -c cdn.sanity.io` — si c'est
  0, le CMS n'alimente rien.
- **`MGYM_HSTS=1` est opt-in**, et doit le rester jusqu'au domaine
  définitif. Servi sans certificat valide, l'en-tête rend le site
  inaccessible **deux ans**, et c'est le navigateur qui mémorise.

### Sanity

- **Le forfait gratuit n'a que deux rôles : Administrator et Viewer.**
  `editor` commence à Growth, 15 $/siège/mois. Pour que la cliente modifie
  son site, elle doit être Administrator — donc capable de supprimer le
  dataset. **La parade est `npm run sauvegarde`, pas le rôle.**
- **Le webhook doit filtrer les brouillons** :
  `!(_id in path("drafts.**"))`. Sanity enregistre les brouillons en
  continu pendant la frappe ; sans filtre, chaque sauvegarde automatique
  déclenche une reconstruction et épuise les 300 minutes mensuelles.
  Le filtre vit dans `rule.filter`, pas dans le champ `filter` de premier
  niveau — ce dernier reste `null`, c'est normal.
- **Sanity refuse les AVIF 10 bits** (`422 Invalid image`). Cinq photos du
  projet le sont. `scripts/migrer.mjs` les convertit en WebP sans perte
  avant l'envoi ; `public/` n'est pas modifié.
- **Les brouillons ne sont pas lisibles sans jeton**, même sur un dataset
  public — vérifié. L'absence de dataset privé n'expose donc rien.

### Code

- **La CSP bloquait tout le JavaScript en développement.** `next dev`
  évalue les modules avec `eval()` ; sans `'unsafe-eval'`, React ne
  s'hydrate jamais : menu mort, sections invisibles, carrousel figé — et
  seulement en local, ce qui rend le défaut très trompeur. L'autorisation
  est accordée si `NODE_ENV != 'production'`. **Ne pas l'étendre à la
  production.**
- **Trois fichiers décrivent les mêmes champs** et rien ne les relie :
  `sanity/schemaTypes/siteContent.js`, `lib/sanity/queries/groq.js`,
  `lib/contenu/source-historique.mjs`. En oublier un donne un champ
  inutilisable. `npm test` le détecte.
- **La copie hors-ligne lit le CMS** depuis `scripts/export-statique.mjs`,
  qui transmet les trois variables publiques et rapatrie les photos de
  `cdn.sanity.io` en local. Sans ça elle livrait le contenu d'avant le CMS,
  silencieusement.
- **Le délai de revalidation est écrit en clair dans trois pages** — Next
  refuse une constante importée. `lib/revalidation.test.mjs` échoue si
  l'une diverge.

### Réseau, si le test local revient sur la table

- **Les box filtrent `*.trycloudflare.com`** (NXDOMAIN sur la box, résolu
  par 1.1.1.1). Les tunnels Cloudflare gratuits sont inutilisables pour une
  démonstration client. `scripts/heberger-tour.sh` utilise `localhost.run`
  par défaut, qui passe.
- **Vercel interdit l'usage commercial sur son offre gratuite**, « être payé
  pour construire le site » inclus. D'où Netlify.

---

## Les commandes

```bash
npm run verifier      # schémas + requêtes + 71 tests + build — la référence
npm run dev           # développement
npm run mobile        # ouvre le site en fenêtre iPhone 13 (390x844)
npm run sauvegarde    # exporte le dataset HORS du dépôt, et vérifie l'archive
npm run livraison     # copie hors-ligne, deux formats
npm run studio:deploy # redéploie le back-office
```

Préfixer par `PATH="$HOME/.local/node22/bin:$PATH"` si `node -v` affiche 18.

Il n'y a **pas de linter** : `npm run verifier` en tient lieu.

---

## La documentation

| Fichier | Pour qui |
|---|---|
| `CLAUDE.md` | conventions du code, pièges du projet |
| `docs/DEPLOIEMENT.md` | le plan complet, 10 étapes, qui fait quoi |
| `docs/SECURITY.md` | 12 points de sécurité, vérifiés |
| `docs/ROLLBACK.md` | restaurer une version |
| `docs/GUIDE-CLIENTE.md` | pour la cliente, pas pour un développeur |
| `docs/SANITY-SCHEMAS.md` | les modèles de contenu |

---

## Contexte humain

Le prestataire est **étudiant en 3ᵉ année à Epitech** et réalise le site
**gracieusement**. Cela a dicté plusieurs choix : pas de VPS à administrer
pendant des années, pas d'abonnement mensuel, une plateforme qui ne demande
aucune maintenance système.

La cliente est une association de village ; son public est **adulte et
souvent senior**. La lisibilité prime sur l'effet technique : ne jamais
réduire la taille du texte ni le contraste pour un gain esthétique.
Lighthouse mesuré : accessibilité 96, performance 91, SEO 100.
