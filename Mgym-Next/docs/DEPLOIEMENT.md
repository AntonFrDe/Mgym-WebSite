# Mise en production — M'GYM

> Phase 8 du plan. Cette étape ne peut pas être exécutée sans deux décisions
> qui ne sont pas techniques. Ce document donne la marche à suivre exacte
> pour chacune, et l'ordre dans lequel les faire.

---

## Les deux décisions préalables

### 1. Le site Next remplace-t-il `mgym.fr` ?

`mgym.fr` sert aujourd'hui un site construit avec **Hostinger Website
Builder**, qui possède son propre éditeur visuel. Le remplacer signifie que
la cliente perd cet éditeur au profit du back-office Sanity.

C'est le but — un éditeur visuel permet de casser la mise en page, Sanity
non — mais **elle doit l'avoir accepté**, et le DNS devra être repointé
depuis Hostinger.

### 2. Quel hébergeur ?

Le site a besoin d'un **runtime Node** : les pages restent générées au build
et servies par un CDN, mais les deux routes `/api/preview*` sont dynamiques.

| | Vercel | Netlify | Cloudflare Pages |
|---|---|---|---|
| Next 15 App Router | natif | adaptateur officiel | adaptateur officiel |
| Deploy Hook | oui | oui | oui |
| Forfait gratuit suffisant | oui | oui | oui |
| Domaine personnalisé | oui | oui | oui |

Les trois conviennent. Vercel demande le moins de configuration pour Next ;
c'est le seul argument qui les sépare vraiment ici.

---

## Ordre des opérations

L'ordre compte : chaque étape dépend de la précédente.

```
1. Créer le projet Sanity          → donne PROJECT_ID   ✅ zqxwi6qy
2. Migrer le contenu               → la cliente voit son site   ✅ 21 documents
3. Déployer le Studio              → elle peut se connecter
4. Déployer le site                → donne l'URL de production
5. Restreindre les CORS            → maintenant qu'on connaît les URL
6. Brancher le Deploy Hook         → « Publier » reconstruit le site
7. Repointer le DNS                → en dernier, quand tout fonctionne
```

---

## 1. Créer le projet Sanity — ✅ fait le 25 août 2026

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

## 2. Migrer le contenu — ✅ fait le 25 août 2026

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

## 3. Déployer le Studio

```bash
npm run studio:deploy
```

Sanity propose une adresse en `*.sanity.studio`. Pour `admin.mgym.fr`, ajoutez
un enregistrement CNAME chez votre registrar vers cette adresse, puis
déclarez le domaine dans les réglages du projet Sanity.

Invitez la cliente : sanity.io/manage → Members → **rôle `editor`**.
Activez la double authentification sur votre compte administrateur.

## 4. Déployer le site

Variables à configurer chez l'hébergeur :

```
NEXT_PUBLIC_SANITY_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET       production
NEXT_PUBLIC_SANITY_API_VERSION   2024-10-01
SANITY_API_READ_TOKEN            (Viewer)
SANITY_PREVIEW_SECRET
```

**À ne PAS configurer : `SANITY_API_WRITE_TOKEN`.** Le site n'écrit jamais
dans Sanity ; ce token ne sert qu'au script de migration, lancé depuis un
poste de développement.

Commande de build : `npm run build`. Rien à changer.

## 5. Restreindre les CORS

**Correction apportée après vérification sur le projet réel.** Ce document
demandait d'autoriser `https://mgym.fr` et `http://localhost:3000`. C'est
inutile, et donc à ne pas faire.

Le CORS ne gouverne que les requêtes émises par un **navigateur**. Or le site
n'en émet aucune vers Sanity : `lib/sanity/client.js` porte `import
'server-only'`, tout le contenu est lu pendant le build. Les photos viennent
de `cdn.sanity.io`, chargées comme n'importe quelle balise `<img>` — le CORS
ne s'y applique pas.

Ajouter le domaine de production à la liste n'apporterait rien et élargirait
la surface pour rien. Seul le **Studio** parle à l'API depuis un navigateur :

```
http://localhost:3333           déjà autorisé par défaut — vérifié
https://<projet>.sanity.studio  à ajouter à l'étape 3
https://admin.mgym.fr           si vous branchez le domaine personnalisé
```

Jamais `*` avec « Allow credentials ».

## 6. Brancher le Deploy Hook

C'est ce qui fait qu'un clic sur **Publier** met le site à jour.

1. Chez l'hébergeur : créer un **Deploy Hook**, copier son URL secrète.
2. Dans Sanity : sanity.io/manage → API → **Webhooks** → Create webhook
   - URL : celle du Deploy Hook
   - Dataset : `production`
   - Trigger on : **Create, Update, Delete**
   - Filter : laisser vide (tout le contenu)
   - HTTP method : POST

> **Aucune route de revalidation n'a été écrite dans le projet, et c'est
> volontaire.** Le Deploy Hook de l'hébergeur est une URL secrète qu'il
> protège lui-même : pas de signature à vérifier, pas de limitation de débit
> à implémenter, pas d'endpoint public à surveiller. Écrire une API maison
> aurait ajouté une surface d'attaque pour un gain nul.

### Vérifier

```bash
npm run verifier:workflow https://mgym.fr
```

Ce script joue les neuf scénarios de la Phase 15 : brouillon invisible en
production, visible en prévisualisation, secret refusé, redirection ouverte
bloquée, publication, historique, étanchéité du client public, sortie de
prévisualisation, en-têtes, blog et référencement.

## 7. Repointer le DNS

**En dernier**, une fois que tout fonctionne sur l'URL de l'hébergeur.

Chez le registrar du domaine (Hostinger aujourd'hui) : remplacer les
enregistrements A / CNAME de `mgym.fr` et `www.mgym.fr` par ceux fournis par
l'hébergeur. Comptez jusqu'à 24 h de propagation.

> ⚠️ **N'activez `Strict-Transport-Security` qu'une fois le certificat HTTPS
> en place.** L'en-tête est déjà déclaré dans `next.config.js` ; s'il est servi
> sur un domaine en HTTP, les navigateurs refuseront le site pendant deux ans.

---

## Après la mise en service

```
□ Jouer npm run verifier:workflow contre la production
□ Tester une restauration réelle (docs/ROLLBACK.md, les 5 cases)
□ Chronométrer les 4 parcours du Studio sur mobile (Phase 19)
□ Mesurer Lighthouse sur la vraie URL — le CDN et la compression
  donneront un meilleur résultat que la mesure locale
□ Remettre à la cliente docs/GUIDE-CLIENTE.md et enregistrer la vidéo
  (docs/SCRIPT-VIDEO.md)
□ Exporter le dataset une première fois :
    npx sanity dataset export production sauvegarde-initiale.tar.gz
```
