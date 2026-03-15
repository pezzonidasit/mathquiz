# MathQuiz V3 — Design : Boss Fights & Contrat d'Objectif

**Date :** 15 mars 2026
**Scope :** 2 features (social/backend repoussé à V4)

---

## Contexte

V2 est stable et déployée. Le brainstorming V3 a impliqué 6 personas (spécialiste enfance, éducation, parent strict, parent fun, enfant compétitif, enfant réticent). Deux features font consensus unanime et fonctionnent en mode solo (pas de backend requis) :

1. **Boss Fights** — combat spectaculaire contre un boss mathématique
2. **Contrat d'objectif** — choix du niveau de défi avant chaque partie

### Contraintes
- Chaque enfant joue sur son propre téléphone (PWA isolée)
- Pas de sync entre appareils, pas de backend
- Le réticent ne doit jamais se sentir forcé
- Le compétitif doit avoir des raisons de viser haut

---

## 1. Boss Fights

### Concept
Un boss apparaît aléatoirement. L'enfant choisit de l'affronter (avec une mise en pièces) ou de le reporter. Le combat = 3 questions chronométrées + 1 question finale multi-étapes. Victoire = loot exclusif. Défaite = pièces perdues.

### Déclenchement
- **Probabilité croissante** : après chaque partie sans boss, la probabilité augmente
  - Partie 1 après dernier boss : 0%
  - Partie 2-5 : 5% par partie
  - Partie 6-10 : 10% par partie
  - Partie 11+ : 20% par partie
  - Garantie à la partie 15
- Quand un boss se déclenche, l'enfant voit un écran d'apparition :
  > "🐉 Le Dragon des Fractions est apparu ! Mise : 50 🪙"
  > [⚔️ L'affronter] [⏳ Plus tard]
- "Plus tard" = le boss reste en attente, accessible depuis l'écran d'accueil (icône boss visible)
- Le boss en attente ne bloque rien — l'enfant peut jouer normalement
- Un seul boss en attente à la fois (pas d'accumulation)

### Structure du combat
Le combat se déroule en 2 phases :

**Phase 1 — Assaut (3 questions chronométrées)**
- Questions de la catégorie du boss, difficulté = niveau actuel de l'enfant + 1 palier
- Timer par question : 15-20 secondes (selon difficulté)
- Chaque bonne réponse = dégâts au boss (barre de vie baisse)
  - Réponse rapide (< 50% du timer) = dégâts critiques (×2)
  - Réponse lente = dégâts normaux
- Chaque mauvaise réponse = le boss attaque (barre de vie joueur baisse)
- Pas d'indice disponible pendant le boss fight

**Phase 2 — Coup Fatal (1 question multi-étapes)**
- Un problème découpé en 2-3 sous-questions enchaînées
- Pas de timer global, mais chaque étape a un timer généreux (30s)
- Si étape ratée → la réponse est donnée, l'enfant continue mais fait moins de dégâts
- Toutes les étapes réussies = coup fatal, le boss est vaincu
- Étapes partielles = le boss peut survivre si le joueur n'a plus assez de PV

**Résolution**
- **Victoire** : loot exclusif + pièces bonus (×3 la mise) + XP bonus + animation épique
- **Défaite** : pièces misées perdues, message encourageant ("Il reviendra... prépare-toi !"), le boss disparaît et la probabilité repart à 0

### Barres de vie
- **Joueur** : 3 PV (3 erreurs = défaite, quelle que soit la phase)
- **Boss** : variable selon le boss (4-6 PV, chaque bonne réponse = 1 PV, critique = 2 PV)
- Affichage : deux barres horizontales face à face en haut de l'écran

### Les Boss (pool initial)
Chaque boss = un nom + une catégorie + un emoji + une difficulté visuelle (couleur de la barre de vie) :

| Boss | Catégorie | Mise | Loot exclusif |
|---|---|---|---|
| 🐉 Dragon des Fractions | Fractions | 50 🪙 | Thème "Antre du Dragon" |
| 🤖 Golem du Calcul | Calcul | 40 🪙 | Titre "Briseur de Golem" |
| 🧙 Sorcier de Logique | Logique | 60 🪙 | Sticker "Grimoire" |
| 📐 Sphinx de Géométrie | Géométrie | 50 🪙 | Badge "Œil du Sphinx" |
| ⚗️ Alchimiste des Mesures | Mesures | 50 🪙 | Effet confetti "Potions" |
| 🌀 Kraken des Problèmes | Problèmes ouverts | 70 🪙 | Thème "Abysses" |

- Le boss est choisi aléatoirement parmi ceux pas encore vaincus
- Un boss vaincu peut revenir en version "Enragé" (plus dur, meilleur loot) après que tous les boss initiaux sont battus
- Rotation : le boss proposé alterne les catégories (pas 2 fois la même d'affilée)

### Questions multi-étapes (Phase 2)
Nouveau format dans `questions.js`. Exemples :

**Dragon des Fractions :**
> Étape 1 : "Marie a 3/4 d'une pizza. Elle en mange 1/3 de ce qu'elle a. Combien a-t-elle mangé ?"
> → Réponse : 1/4
> Étape 2 : "Combien lui reste-t-il ?"
> → Réponse : 1/2

**Golem du Calcul :**
> Étape 1 : "Un train roule à 120 km/h pendant 2h30. Quelle distance parcourt-il ?"
> → Réponse : 300
> Étape 2 : "Il lui reste 180 km. Combien de temps lui faut-il encore ?" (en minutes)
> → Réponse : 90

Format dans le code :
```js
{
  boss: 'dragon',
  steps: [
    { text: "...", answer: 0.25, unit: "pizza", hint: "...", explanation: "..." },
    { text: "...", answer: 0.5, unit: "pizza", hint: "...", explanation: "..." }
  ]
}
```

### Badges liés aux boss
- "Première Victoire" — battre un boss pour la première fois
- "Tueur de Boss" — battre les 6 boss
- "Sans Égratignure" — battre un boss sans perdre de PV
- "Critique !" — 3 réponses critiques (rapides) dans un seul combat
- "Chasseur de Dragons" (caché) — battre le Dragon Enragé

---

## 2. Contrat d'Objectif

### Concept
Après avoir choisi catégorie/difficulté/nombre de questions (flow existant inchangé), l'enfant voit 3 objectifs calibrés sur ses stats récentes. Il en choisit un (ou ignore le contrat). L'objectif atteint donne un bonus de pièces.

### Flow
1. L'enfant configure sa partie normalement (catégorie, difficulté, nombre)
2. Écran "Contrat" apparaît avec 3 options :

```
┌─────────────────────────────────────┐
│  🎯 Choisis ton défi !              │
│                                     │
│  🥉 Bronze : 3/5 correct            │
│     Bonus : +10 🪙                  │
│                                     │
│  🥈 Argent : 4/5 correct, < 2 min   │
│     Bonus : +30 🪙                  │
│                                     │
│  🥇 Or : 5/5 sans indice            │
│     Bonus : +60 🪙                  │
│                                     │
│  [Jouer sans contrat]               │
└─────────────────────────────────────┘
```

3. L'objectif choisi s'affiche discrètement pendant la partie (sous le score)
4. En fin de partie :
   - Contrat réussi → animation + bonus + message ("Contrat Or rempli ! +60 🪙")
   - Contrat échoué → pas de malus, juste "Contrat non rempli — la prochaine fois !"

### Calibrage des objectifs
Les seuils s'adaptent aux stats récentes de l'enfant (20 dernières questions dans cette catégorie/difficulté) :

| Palier | Seuil de réussite requis | Conditions supplémentaires | Bonus |
|---|---|---|---|
| Bronze | taux récent − 10% | aucune | +10 🪙 |
| Argent | taux récent | condition tempo ou sans indice | +30 🪙 |
| Or | taux récent + 15% | sans indice + condition tempo | +60 🪙 |

**Exemples concrets :**
- Enfant avec 80% récent en Calcul Moyen :
  - Bronze : 3/5 correct (60%) → facile, filet de sécurité
  - Argent : 4/5 correct (80%) en < 3min → son niveau habituel + vitesse
  - Or : 5/5 correct (100%) sans indice → stretch goal

- Enfant avec 50% récent en Fractions Difficile :
  - Bronze : 2/5 correct (40%) → atteignable
  - Argent : 3/5 correct (50%) → son niveau
  - Or : 4/5 correct (70%) sans indice → ambitieux

**Premiers jeux (pas assez de données)** : seuils par défaut basés sur la difficulté choisie :
- Facile : Bronze 60%, Argent 80%, Or 100%
- Moyen : Bronze 50%, Argent 70%, Or 90%
- Difficile : Bronze 40%, Argent 60%, Or 80%

### Conditions supplémentaires (pool)
L'algorithme pioche dans ce pool pour rendre les contrats variés :
- "Sans indice"
- "En moins de X minutes" (X calibré sur le temps moyen récent)
- "Sans erreur consécutive" (pas 2 faux d'affilée)
- "Au moins 1 réponse rapide (< 10s)"
- "Streak de 3 minimum"

Argent = 1 condition supplémentaire. Or = 2 conditions.

### Interaction avec les boosts
- Les boosts existants (XP, coins, score, hints) se combinent avec le contrat
- Un boost "Score ×1.5" + Contrat Or = grosse récompense MAIS le boost est perdu si pas 100% → tension maximale
- Le hint pack rend la condition "sans indice" du contrat inutile → stratégie intéressante

### Interaction avec les Boss Fights
- Le contrat ne s'applique PAS pendant un boss fight (le boss a ses propres enjeux)
- MAIS : réussir un contrat Or donne un badge de progression → les badges débloquent... rien pour l'instant (future V4 : tickets boss, skill tree, etc.)

### Badges liés aux contrats
- "Premier Contrat" — compléter un contrat (n'importe quel palier)
- "Chasseur d'Or" — compléter 10 contrats Or
- "Perfectionniste" — compléter 5 contrats Or d'affilée
- "Polyvalent" — compléter un contrat Or dans chaque catégorie
- "Tout Bronze" (caché) — compléter 20 contrats Bronze (l'anti-grind ironique)

---

## 3. Impact sur l'économie existante

### Nouvelles sources de pièces
| Source | Pièces |
|---|---|
| Contrat Bronze | +10 |
| Contrat Argent | +30 |
| Contrat Or | +60 |
| Boss vaincu | +120 à +210 (×3 la mise) |
| Boss vaincu Sans Égratignure | +bonus 50 |

### Impact sur le rythme
- Sans contrat : ~37 🪙 par partie (inchangé)
- Avec contrat Argent : ~67 🪙 par partie (+80%)
- Avec contrat Or : ~97 🪙 par partie (+160%)
- Boss vaincu : ~150-260 🪙 (événement rare, ~1 toutes les 8-15 parties)

Les récompenses réelles (500-10000 🪙) restent un objectif long terme. Le contrat Or accélère sans trivialiser.

### Nouveaux items de loot
- 6 thèmes/titres/stickers/effets exclusifs boss (non achetables en boutique)
- Collection "Chasseur de Boss" visible dans le profil

---

## 4. UI/UX

### Écran d'accueil — changements
- Si un boss est en attente : icône boss animée (pulse) dans un coin, cliquable
- Le reste de l'écran d'accueil est inchangé

### Écran de configuration de partie — changements
- Après le bouton "Jouer", nouvel écran intermédiaire : le contrat
- Bouton "Jouer sans contrat" en bas (discret mais accessible)

### Écran de combat boss (nouveau)
- Background spécial (couleur du boss, ambiance)
- Deux barres de vie en haut (joueur à gauche, boss à droite)
- Emoji boss grand au centre, animé (tremble quand touché, grossit quand attaque)
- Questions en bas
- Timer circulaire autour du bouton de validation
- Transition Phase 1 → Phase 2 : animation "COUP FATAL !" avant la question multi-étapes

### Écran de fin de partie — changements
- Si contrat actif : résultat du contrat affiché avant les stats (réussi = confetti, échoué = sobre)
- Si boss vaincu : écran de loot spécial (animation d'ouverture comme les coffres)

---

## 5. Fichiers impactés

| Fichier | Changements |
|---|---|
| `js/app.js` | Boss fight flow, contrat flow, nouveaux écrans |
| `js/questions.js` | Questions multi-étapes (nouveau format `steps`), pool boss questions |
| `js/progression.js` | Boss loot tables, nouveaux badges, contrat bonus calcul |
| `css/style.css` | Écran boss fight, barres de vie, contrat UI, animations |
| `index.html` | Nouveaux écrans (boss fight, contrat, boss en attente) |
| `js/themes.js` | Nouveaux thèmes boss (Antre du Dragon, Abysses) |

---

## 6. Hors scope V3

- Classement entre profils (besoin backend → V4)
- Création d'énigmes partagées (besoin sync → V4)
- Tableau de bord parent (besoin accès cross-device → V4)
- Skill tree (trop de contenu à structurer → V4+)
- Carnet d'erreurs / reprise espacée (V4+)
- Mascottes animées (V4+)
