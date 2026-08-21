# Modifier votre site — mode d'emploi

> Ce guide s'adresse à vous, pas à un développeur. Aucune connaissance
> technique n'est nécessaire. Vous ne verrez jamais de code.

---

## Comment ça marche, en une phrase

Vous vous connectez à votre **espace d'administration**, vous modifiez ce que
vous voulez, vous **regardez le résultat**, et quand cela vous convient vous
cliquez sur **Publier**. Tant que vous n'avez pas publié, le site public ne
change pas.

```
Je modifie  →  J'enregistre (brouillon)  →  Je regarde  →  Je publie
```

**Vous ne pouvez rien casser.** Les couleurs, les polices et la mise en page
ne sont pas modifiables : elles ne vous sont même pas proposées. Vous ne
touchez qu'aux textes, aux photos et aux horaires.

---

## Se connecter

Rendez-vous sur **admin.mgym.fr** et connectez-vous avec l'adresse e-mail sur
laquelle vous avez reçu l'invitation.

Vous arrivez sur un menu à gauche :

```
📅 Planning des cours
   Créneaux réguliers
   Annulations & changements
   Périodes de fermeture
✨ Événements & stages
📝 Articles du blog
🏋️ Les activités
──────────────
📄 Textes du site
📞 Infos pratiques
🔍 Référencement
```

---

## Annuler le cours de mardi prochain

**Le geste le plus fréquent. Moins de 30 secondes.**

1. Menu **Planning des cours** → **Créneaux réguliers**
2. Cliquez sur le cours concerné — ils sont nommés « Pilates — Mardi 18h30 »
3. Menu **⋯** en haut à droite → **Annuler une date**
4. Choisissez la date, ajoutez un motif si vous voulez (« Jour férié »)
5. **Créer l'annulation**, puis **Publier**

> ⚠️ **Ne modifiez pas le créneau lui-même** pour annuler une seule séance :
> cela changerait tous les mardis de l'année. L'annulation ponctuelle est
> faite pour ça, et le cours reprend normalement la semaine suivante.

Pour toute une semaine de vacances, utilisez plutôt **Périodes de fermeture** :
une seule saisie masque tous les cours de la période.

---

## Changer une photo

**Moins d'une minute.**

1. Menu **Textes du site**
2. Choisissez l'onglet de la section concernée — Accueil, À propos, Coach…
3. Cliquez sur la photo actuelle → **Upload**
4. Choisissez votre fichier
5. **Déplacez le point** qui apparaît sur l'image : c'est ce que le site
   gardera visible quand il devra recadrer. Placez-le sur le visage ou sur le
   sujet principal.
6. Remplissez **Description de l'image** — une phrase. Elle est lue à voix
   haute aux personnes malvoyantes et s'affiche si la photo ne charge pas.
7. **Publier**

> Format conseillé : paysage, 1200 pixels de large minimum. Les fichiers
> `.svg` sont refusés pour des raisons de sécurité.

---

## Ajouter un stage ou un atelier

**Moins de deux minutes.**

1. Menu **Événements & stages** → **À venir** → bouton **+**
2. Remplissez le titre, la date de début, et cliquez sur **Generate** à côté
   de l'adresse web
3. Le reste est facultatif : lieu, tarif, nombre de places, photo, description
4. **Publier**

**Astuce.** Pour un stage semblable à un précédent : ouvrez l'ancien, menu
**⋯** → **Dupliquer**. Vous n'avez plus qu'à changer la date. La copie arrive
en brouillon, avec « (copie) » dans le titre — impossible de publier un
doublon par erreur.

> Le champ **Statut** (« Complet », « Annulé ») n'a rien à voir avec le bouton
> Publier. Un stage complet reste visible sur le site — c'est justement
> l'information à donner.

---

## Publier un article de blog

**Environ cinq minutes.**

1. Menu **Articles du blog** → **+**
2. Titre, puis **Generate** pour l'adresse web
3. **Résumé** : deux ou trois phrases, affichées dans la liste des articles
4. **Image de couverture**
5. **Texte de l'article** : écrivez normalement. Vous pouvez mettre en gras,
   en italique, faire des listes, poser des liens et créer des sous-titres.
   Utilisez les sous-titres pour aérer : un texte de plus de trois
   paragraphes sans respiration décourage la lecture.
6. Onglet **Référencement** : laissez vide, le site reprendra le titre et le
   résumé. Ne remplissez ces deux champs que si vous voulez un texte
   différent dans Google.
7. **Publier**

---

## Regarder avant de publier

C'est l'étape qui enlève la peur de se tromper.

1. Après vos modifications, **enregistrez** (cela se fait tout seul)
2. Cliquez sur **Voir le site** en haut à droite
3. Le site s'ouvre **avec vos modifications**, dans un bandeau
   « Mode prévisualisation »
4. Si cela vous convient, revenez et cliquez sur **Publier**
5. Sinon, corrigez et regardez à nouveau

> Le site public **n'a pas changé** pendant tout ce temps. Seule l'action
> **Publier** le met à jour, une à deux minutes plus tard.

---

## Revenir en arrière

Vous avez publié quelque chose de faux ? Rien n'est perdu.

1. Ouvrez le document concerné
2. Menu **⋯** → **History**
3. Parcourez les versions à droite : chacune est datée
4. Choisissez celle d'avant l'erreur → **Restore**
5. **Regardez** le résultat en prévisualisation
6. **Publier**

> Restaurer ne publie rien tout seul : l'ancienne version revient **en
> brouillon**. Vous vérifiez d'abord, vous publiez ensuite.

La marche à suivre détaillée est dans `ROLLBACK.md`.

---

## Aide-mémoire

| Je veux… | Je vais dans… |
|---|---|
| Changer un texte de la page d'accueil | **Textes du site** → onglet de la section |
| Changer une photo | **Textes du site** → onglet de la section |
| Annuler un cours une fois | **Planning** → **Créneaux** → ⋯ → Annuler une date |
| Fermer pour les vacances | **Planning** → **Périodes de fermeture** |
| Changer un horaire pour toute l'année | **Planning** → **Créneaux réguliers** |
| Ajouter une activité | **Les activités** → **+** |
| Retirer une activité sans l'effacer | **Les activités** → décocher « Afficher sur le site » |
| Annoncer un stage | **Événements & stages** |
| Écrire un article | **Articles du blog** |
| Changer le téléphone ou l'adresse | **Infos pratiques** |
| Changer un tarif | **Textes du site** → onglet **Tarifs** |
| Changer ce que Google affiche | **Référencement** |

---

## Trois choses à retenir

1. **Enregistrer n'est pas publier.** Le site ne change qu'au clic sur
   *Publier*.
2. **Regardez avant de publier.** Le bouton *Voir le site* est là pour ça.
3. **Rien n'est jamais perdu.** L'historique permet de revenir en arrière.

---

## En cas de doute

Ne supprimez rien. Décochez plutôt « Afficher sur le site » : l'élément
disparaît du site mais reste ici, et se remet en un clic.
