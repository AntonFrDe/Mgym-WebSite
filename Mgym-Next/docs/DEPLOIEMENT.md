# Mise en production — M'GYM

> Plan d'action jusqu'à la publication, mis à jour le 25 août 2026.
> Chaque étape indique **qui la fait**. L'ordre compte : une étape en avance
> se refait.

---

## Où en est-on

| | |
|---|---|
| Projet Sanity | `zqxwi6qy`, dataset `production` |
| Contenu | 21 documents, 13 photos, 0 brouillon |
| Contrôles | 67 tests · 21/21 scénarios de workflow · 3/3 historique |
| Vulnérabilités | 0 |
| Code | branche `REFONTE-3`, 35 commits d'avance sur `main` |
| Hébergement | **aucun** — le site ne tourne nulle part |
| `mgym.fr` | sert toujours le site Hostinger Website Builder |

---

## Vue d'ensemble

```
0. Décisions et questions de contenu          VOUS
1. Régénérer les deux jetons                  VOUS
2. Déployer le Studio                         ✅ mgym.sanity.studio
3. Fusionner REFONTE-3 dans main              MOI
4. Créer le projet chez l'hébergeur           VOUS
5. Brancher le Deploy Hook                    vous créez, je configure et je teste
6. Vérifier en production                     MOI
7. Repointer le DNS                           VOUS
8. Remettre le site à la cliente              partagé
```

---

## Étape 0 — Décisions et questions de contenu — **vous**

Trois questions bloquent des étapes plus loin. Aucune n'est technique.

### 0.1 Le site Next remplace-t-il `mgym.fr` ?

`mgym.fr` sert aujourd'hui un site **Hostinger Website Builder**, qui a son
propre éditeur visuel. Le remplacer signifie que la cliente perd cet éditeur
au profit de Sanity.

C'est le but — un éditeur visuel permet de casser la mise en page, Sanity non
— mais **elle doit l'avoir accepté avant** que le DNS ne bouge.

### 0.2 Quel hébergeur ?

Le site a besoin d'un **runtime Node** : les pages sont générées au build et
servies par un CDN, mais les deux routes `/api/preview*` sont dynamiques.

| | Vercel | Netlify | Cloudflare Pages |
|---|---|---|---|
| Next 15 App Router | natif | adaptateur officiel | adaptateur officiel |
| Deploy Hook | oui | oui | oui |
| Forfait gratuit suffisant | oui | oui | oui |
| Domaine personnalisé | oui | oui | oui |

Les trois conviennent. **Vercel** demande le moins de configuration pour
Next ; c'est le seul argument qui les sépare réellement ici.

### 0.3 Deux incohérences de contenu, signalées et toujours ouvertes

Elles ne bloquent pas la technique, mais elles seront visibles par les
adhérentes dès la mise en ligne.

- **La saison.** Le site annonce « Saison 2025 — 2026 ». Le formulaire
  d'inscription Google s'intitule « ADHESION 26/27 ». L'un des deux est
  périmé.
- **Le tarif famille.** 410 € pour deux personnes, alors que deux adhésions
  individuelles font 2 × 215 € = 430 €. L'écart de 20 € est-il voulu ?

Répondez-moi et je corrige dans Sanity — ou laissez la cliente le faire
elle-même depuis le Studio, ce qui est un bon premier exercice.

---

## Étape 1 — Régénérer les deux jetons — **vous**

Les jetons `mgym-lecture` et `mgym-migration` ont circulé en clair dans notre
conversation. Avant toute mise en ligne :

<https://www.sanity.io/manage/project/zqxwi6qy/api> → Tokens → supprimer les
deux, en recréer deux.

Le jeton **Editor** ne sert plus qu'à `scripts/tester-workflow.mjs`. Si vous
ne comptez pas relancer ce test, ne le recréez pas du tout : le site n'écrit
jamais dans Sanity.

---

## Étape 2 — Déployer le Studio — ✅ fait le 25 août 2026

Le back-office est en ligne : **<https://mgym.sanity.studio>**

```
projet      zqxwi6qy
workspace   mgym
dataset     production
appId       boxdaz4dq35cp6n8w9v3z44x
```

L'adresse et l'`appId` sont figés dans `sanity.cli.js`. Les deux sont
demandés de façon interactive sinon, et une réponse distraite changerait
l'adresse mise en favori par la cliente, ou créerait un second Studio.

> L'adresse **redirige vers `sanity.io` et demande une connexion**. Ce n'est
> pas une panne : Sanity héberge désormais les Studios dans son tableau de
> bord, et un back-office se connecte. La cliente peut garder
> `mgym.sanity.studio` en favori.

**CORS : rien à faire.** Seul `http://localhost:3333` est déclaré sur le
projet ; les origines en `*.sanity.studio` sont autorisées implicitement —
vérifié par en-tête de réponse.

### Ce qui reste sur cette étape — **vous**

- inviter la cliente : sanity.io/manage → Members → rôle **`editor`**
  (jamais administrator) ;
- activer la **double authentification** sur votre compte ;
- **ouvrir le Studio et vérifier** que les 21 documents sont là et que les
  photos s'affichent — la seule chose que je ne peux pas voir d'ici ;
- pour une adresse en `admin.mgym.fr` plutôt qu'en `*.sanity.studio` :
  ajouter un CNAME chez le registrar vers l'adresse Sanity, puis déclarer
  le domaine dans les réglages du projet. Facultatif, et repoussable.

---

## Étape 3 — Fusionner `REFONTE-3` dans `main` — **moi**

L'hébergeur déploie une branche. `main` est aujourd'hui 35 commits en
arrière : la déployer publierait le site d'avant le CMS.

La fusion est une avance rapide, sans conflit possible. Je la fais quand vous
me le dites — c'est votre branche principale, je ne la déplace pas sans
accord.

---

## Étape 4 — Créer le projet chez l'hébergeur — **vous**

Je ne peux pas le faire : cela demande votre compte et une autorisation
d'accès à votre dépôt GitHub.

> ⚠️ **Le dépôt n'a pas le projet à sa racine.** `Mgym-WebSite/` contient
> `Mgym-Next/`. Il faut renseigner **Root Directory = `Mgym-Next`**, sinon le
> build ne trouve pas `package.json`.

| Réglage | Valeur |
|---|---|
| Framework | Next.js (détecté) |
| Root Directory | **`Mgym-Next`** |
| Build command | `npm run build` |
| Node | 22 (voir `.nvmrc`) |

Les cinq variables d'environnement :

```
NEXT_PUBLIC_SANITY_PROJECT_ID    zqxwi6qy
NEXT_PUBLIC_SANITY_DATASET       production
NEXT_PUBLIC_SANITY_API_VERSION   2024-10-01
SANITY_API_READ_TOKEN            le nouveau jeton Viewer
SANITY_PREVIEW_SECRET            je vous le donne, il est dans .env.local
```

**À NE PAS configurer : `SANITY_API_WRITE_TOKEN`.** Le site n'écrit jamais
dans Sanity. Un jeton d'écriture chez l'hébergeur est une porte ouverte pour
rien.

---

## Étape 5 — Brancher le Deploy Hook — **vous créez, je configure**

C'est ce qui fait qu'un clic sur **Publier** met le site à jour.

**Vous** : chez l'hébergeur, créer un **Deploy Hook** et me donner son URL —
ou la coller vous-même dans Sanity avec les réglages ci-dessous.

**Réglages du webhook** (sanity.io/manage → API → Webhooks → Create) :

| Champ | Valeur |
|---|---|
| URL | celle du Deploy Hook |
| Dataset | `production` |
| Trigger on | Create, Update, Delete |
| Filter | vide |
| HTTP method | POST |

> **Aucune route de revalidation n'a été écrite, et c'est délibéré.** Le
> Deploy Hook est une URL secrète que l'hébergeur protège lui-même : rien à
> signer, rien à limiter en débit, aucun point d'entrée public de plus à
> surveiller.

---

## Étape 6 — Vérifier en production — **moi**

Dès que l'URL existe :

```bash
node scripts/tester-workflow.mjs https://<url-de-production>
```

Les 21 contrôles : brouillon invisible en production, visible en
prévisualisation, secret refusé sans indice, redirection ouverte bloquée,
publication, historique, étanchéité du client public, sortie de
prévisualisation, en-têtes, blog, référencement.

Puis :

- **restreindre les CORS** — voir `SECURITY.md` point 6. Le site n'a besoin
  d'aucune origine ; seul le Studio en demande une.
- **une publication réelle de bout en bout** : modifier un texte dans le
  Studio, cliquer Publier, chronométrer jusqu'à ce que le site change.
- **une restauration réelle** : les 5 cases de `ROLLBACK.md`.
- **Lighthouse sur la vraie URL.** À refaire obligatoirement : les photos
  viennent maintenant de `cdn.sanity.io`, un autre domaine. J'ai déjà vérifié
  qu'**aucune préconnexion n'est déclarée** — le navigateur doit résoudre le
  DNS et négocier le TLS avant de commencer à télécharger l'image la plus
  grande de la page. Je corrigerai si la mesure le confirme.
- **une sauvegarde du dataset** :
  `npx sanity dataset export production sauvegarde-initiale.tar.gz`

---

## Étape 7 — Repointer le DNS — **vous**

**En dernier**, une fois que tout fonctionne sur l'URL de l'hébergeur.

Chez Hostinger : remplacer les enregistrements A / CNAME de `mgym.fr` et
`www.mgym.fr` par ceux fournis par l'hébergeur. Jusqu'à 24 h de propagation.

> ⚠️ **`Strict-Transport-Security` est déjà déclaré dans `next.config.js`.**
> Servi sur un domaine dont le certificat HTTPS n'est pas encore en place,
> les navigateurs refuseront le site **pendant deux ans**. Vérifiez que
> l'hébergeur a émis le certificat avant que le DNS ne bascule.

---

## Étape 8 — Remettre le site à la cliente — **partagé**

**Moi** : `docs/GUIDE-CLIENTE.md` relu et à jour, copie hors-ligne
régénérée (`npm run livraison`), sauvegarde initiale du dataset.

**Vous** : la vidéo de prise en main (script prêt dans
`docs/SCRIPT-VIDEO.md`), et la séance de formation.

**À chronométrer avec elle sur son téléphone** — c'est la phase 19, la seule
que je ne peux pas terminer seul : modifier un tarif, ajouter un créneau,
publier un article, changer une photo.

---

---

# Annexe — ce qui est déjà fait

## Le projet Sanity — ✅ 25 août 2026

```
projet    zqxwi6qy
dataset   production   existant, public en lecture, vide
```

`.env.local` est rempli, le secret de prévisualisation est généré (64
caractères hexadécimaux). Vérifié dans cet état :

| Contrôle | Résultat |
|---|---|
| `npm run verifier` | schémas, requêtes, 67 tests, build — tout passe |
| les 13 requêtes GROQ jouées contre le serveur Sanity | acceptées |
| contenu affiché avec un dataset vide | le contenu par défaut, intact |
| secrets présents dans un bundle navigateur | aucun |
| `npm run studio:build` | compile, n'embarque que `SANITY_STUDIO_*` |

Reste à créer **deux tokens** sur
<https://www.sanity.io/manage/project/zqxwi6qy/api> → Tokens :

| Nom | Rôle | Où il va |
|---|---|---|
| `mgym-lecture` | **Viewer** | `.env.local` et l'hébergeur |
| `mgym-migration` | **Editor** | `.env.local` seulement, effaçable après |

Le second ne sert qu'une fois, à l'étape 2. Le supprimer ensuite est le
choix le plus sûr : le site n'écrit jamais dans Sanity.

> Les commandes `sanity deploy` et `sanity dataset export` réclament une
> session (`npx sanity login`, qui ouvre un navigateur). Pour les jouer sans
> interaction — CI, ou poste sans navigateur — un token d'administration
> passé en `SANITY_AUTH_TOKEN` les remplace.

## Le contenu — ✅ 25 août 2026

```bash
npm run migrer          # simulation, n'écrit rien : à lire avant
npm run migrer:ecrire   # applique
```

21 documents dans `production` : 8 activités, 10 créneaux, `siteContent`,
`infosPratiques`, `seoGlobal`, plus 13 photos dans la médiathèque. Relancer
la commande réécrit les mêmes documents — vérifié, le compte ne bouge pas.

> **Cinq photos ont dû être converties.** `fond1`, `Logo`, `CoachMassage`,
> `MarcheNordique` et `coachHelpingChienTTenHauyt` sont des AVIF **10 bits**,
> que le décodeur de Sanity refuse (`422 Invalid image`). Le script les
> convertit en WebP sans perte avant l'envoi ; `public/` n'est pas touché.
> Les huit images d'activités, en 8 bits, passent telles quelles.

Les neuf scénarios de la Phase 15 ont été joués contre ce projet :

```bash
npm run build && npm start          # dans un terminal
node scripts/tester-workflow.mjs    # dans un autre
```

**21 contrôles sur 21.** Brouillon invisible en production, visible en
prévisualisation, secret refusé sans indice, redirection ouverte bloquée,
publication, historique récupérable, étanchéité du client public, sortie de
prévisualisation, en-têtes, blog et référencement.

## Une fois en ligne — ce qui revient

Ces points ne font pas partie de la mise en service : ils commencent après.

- **Sauvegarder le dataset** avant chaque intervention importante :
  `npx sanity dataset export production sauvegarde-AAAA-MM-JJ.tar.gz`.
  C'est la seule copie qui ne dépende pas de Sanity.
- **La rétention d'historique dépend du forfait.** Sur le plan gratuit elle
  est courte : une restauration se joue en jours, pas en mois. Une
  sauvegarde régulière est ce qui comble l'écart.
- **Si la cliente casse quelque chose** : `docs/ROLLBACK.md`. Le site retombe
  déjà tout seul sur `lib/contenu/defaut.js` si un champ est vidé — une
  section ne peut pas disparaître par accident.
- **Regénérer la copie hors-ligne** après une modification importante :
  `npm run livraison`. Elle lit maintenant le contenu du CMS, elle n'est donc
  plus figée dans le temps.
