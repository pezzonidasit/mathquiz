# MathQuiz V3 Implementation Plan — Boss Fights & Contrat d'Objectif

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Boss Fights (risk/reward combat encounters) and Contrat d'Objectif (pre-game challenge tiers) to MathQuiz V2.

**Architecture:** Two independent features layered onto the existing game loop. Boss fights introduce a new screen and game mode with health bars and multi-step questions. Contrat d'objectif inserts an optional challenge selection between config and game start. Both features share new badge definitions and coin rewards but don't depend on each other.

**Tech Stack:** Vanilla HTML/CSS/JS, localStorage via ProfileManager, no build tools.

---

## Task 1: Boss Data & Multi-Step Questions in `questions.js`

**Files:**
- Modify: `js/questions.js` (append at end, after `generateQuestion()`)

**Step 1: Add BOSS_POOL constant and BOSS_QUESTIONS pool**

Append to `js/questions.js` after the existing `generateQuestion` function:

```js
// ── Boss Fight Data ──────────────────────────────────────────────────

const BOSS_POOL = [
  { id: 'dragon',    name: 'Dragon des Fractions',     emoji: '🐉', category: 'fractions', stake: 50, hp: 5, lootType: 'theme',   lootId: 'boss_dragon',  lootName: 'Antre du Dragon' },
  { id: 'golem',     name: 'Golem du Calcul',          emoji: '🤖', category: 'calcul',    stake: 40, hp: 4, lootType: 'title',   lootId: 'boss_golem',   lootName: 'Briseur de Golem' },
  { id: 'sorcier',   name: 'Sorcier de Logique',       emoji: '🧙', category: 'logique',   stake: 60, hp: 5, lootType: 'sticker', lootId: 'boss_sorcier', lootName: 'Grimoire' },
  { id: 'sphinx',    name: 'Sphinx de Géométrie',      emoji: '📐', category: 'geometrie', stake: 50, hp: 5, lootType: 'badge',   lootId: 'boss_sphinx',  lootName: 'Œil du Sphinx' },
  { id: 'alchimiste',name: 'Alchimiste des Mesures',   emoji: '⚗️', category: 'mesures',   stake: 50, hp: 5, lootType: 'effect',  lootId: 'boss_alchimiste', lootName: 'Potions' },
  { id: 'kraken',    name: 'Kraken des Problèmes',     emoji: '🌀', category: 'ouvert',    stake: 70, hp: 6, lootType: 'theme',   lootId: 'boss_kraken',  lootName: 'Abysses' },
];

/**
 * Multi-step "final blow" questions for boss fights.
 * Each boss has 3+ questions; one is picked randomly per fight.
 * Format: { boss: 'id', steps: [{ text, answer, unit, hint, explanation }] }
 */
const BOSS_QUESTIONS = [
  // Dragon des Fractions
  {
    boss: 'dragon',
    steps: [
      { text: "Marie a 3/4 d'une pizza. Elle en mange 1/3 de ce qu'elle a. Combien de pizza a-t-elle mangé ? (en fraction décimale)", answer: 0.25, unit: '', hint: "1/3 de 3/4 = ?", explanation: "1/3 × 3/4 = 3/12 = 1/4 = 0.25" },
      { text: "Combien de pizza lui reste-t-il ? (en fraction décimale)", answer: 0.5, unit: '', hint: "3/4 − 1/4 = ?", explanation: "3/4 − 1/4 = 2/4 = 1/2 = 0.5" },
    ]
  },
  {
    boss: 'dragon',
    steps: [
      { text: "Un gâteau est partagé en 8 parts. Liam mange 3 parts, Noé mange 2 parts. Quelle fraction du gâteau reste-t-il ? Donne le numérateur (dénominateur = 8).", answer: 3, unit: '', hint: "8 − 3 − 2 = ?", explanation: "8 − 3 − 2 = 3 parts restantes, soit 3/8." },
      { text: "Si on partage ce reste entre 3 personnes, chacune reçoit combien de huitièmes ?", answer: 1, unit: '', hint: "3 parts ÷ 3 personnes", explanation: "3 ÷ 3 = 1. Chacun reçoit 1/8 du gâteau." },
    ]
  },
  {
    boss: 'dragon',
    steps: [
      { text: "Un réservoir est rempli au 2/5. On ajoute 1/5 de sa capacité. À quelle fraction est-il rempli ? Donne le numérateur (dénominateur = 5).", answer: 3, unit: '', hint: "2/5 + 1/5 = ?", explanation: "2/5 + 1/5 = 3/5" },
      { text: "Le réservoir fait 100 litres. Combien de litres contient-il maintenant ?", answer: 60, unit: 'litres', hint: "3/5 de 100", explanation: "3/5 × 100 = 60 litres" },
    ]
  },

  // Golem du Calcul
  {
    boss: 'golem',
    steps: [
      { text: "Un train roule à 120 km/h pendant 2h30. Quelle distance parcourt-il ?", answer: 300, unit: 'km', hint: "120 × 2.5", explanation: "120 × 2.5 = 300 km" },
      { text: "Il lui reste 180 km. Combien de minutes lui faut-il encore ?", answer: 90, unit: 'min', hint: "180 ÷ 120 = ? heures, puis convertis en minutes", explanation: "180 ÷ 120 = 1.5 h = 90 minutes" },
    ]
  },
  {
    boss: 'golem',
    steps: [
      { text: "Un magasin vend 3 cartons de 24 bouteilles et 5 cartons de 12 bouteilles. Combien de bouteilles en tout ?", answer: 132, unit: '', hint: "3×24 + 5×12", explanation: "3×24=72, 5×12=60, 72+60=132" },
      { text: "Chaque bouteille coûte 2€. On a une réduction de 15€. Quel est le prix final ?", answer: 249, unit: '€', hint: "132 × 2 − 15", explanation: "132 × 2 = 264, 264 − 15 = 249€" },
    ]
  },
  {
    boss: 'golem',
    steps: [
      { text: "Papa a 250€. Il achète 3 livres à 18€ chacun. Combien lui reste-t-il ?", answer: 196, unit: '€', hint: "250 − 3×18", explanation: "3×18=54, 250−54=196€" },
      { text: "Il veut acheter un jeu à 45€ et un sac à 38€. A-t-il assez ? Si oui, combien lui restera-t-il ?", answer: 113, unit: '€', hint: "196 − 45 − 38", explanation: "45+38=83, 196−83=113€. Oui, il a assez !" },
    ]
  },

  // Sorcier de Logique
  {
    boss: 'sorcier',
    steps: [
      { text: "Une suite magique : 2, 6, 18, 54, ... Quel est le nombre suivant ?", answer: 162, unit: '', hint: "Chaque nombre est multiplié par...", explanation: "×3 à chaque fois. 54 × 3 = 162" },
      { text: "Quel est le 7ème nombre de cette suite ?", answer: 1458, unit: '', hint: "Continue : 162, 486, ...", explanation: "162, 486, 1458. Le 7ème = 1458" },
    ]
  },
  {
    boss: 'sorcier',
    steps: [
      { text: "J'ai un nombre. Si je le multiplie par 3 et que j'ajoute 7, j'obtiens 34. Quel est ce nombre ?", answer: 9, unit: '', hint: "(34 − 7) ÷ 3", explanation: "34 − 7 = 27, 27 ÷ 3 = 9" },
      { text: "Si maintenant je prends ce nombre, je le mets au carré et je retire 1, qu'est-ce que j'obtiens ?", answer: 80, unit: '', hint: "9 × 9 − 1", explanation: "9² = 81, 81 − 1 = 80" },
    ]
  },

  // Sphinx de Géométrie
  {
    boss: 'sphinx',
    steps: [
      { text: "Un rectangle mesure 12 cm de long et 8 cm de large. Quel est son périmètre ?", answer: 40, unit: 'cm', hint: "2 × (12 + 8)", explanation: "2 × (12+8) = 2×20 = 40 cm" },
      { text: "On coupe ce rectangle en diagonale. Quelle est l'aire d'un des triangles obtenus ?", answer: 48, unit: 'cm²', hint: "L'aire du rectangle ÷ 2", explanation: "12×8=96, 96÷2 = 48 cm²" },
    ]
  },
  {
    boss: 'sphinx',
    steps: [
      { text: "Un carré a un périmètre de 36 cm. Quel est son côté ?", answer: 9, unit: 'cm', hint: "Périmètre ÷ 4", explanation: "36 ÷ 4 = 9 cm" },
      { text: "Quelle est l'aire de ce carré ?", answer: 81, unit: 'cm²', hint: "côté × côté", explanation: "9 × 9 = 81 cm²" },
    ]
  },

  // Alchimiste des Mesures
  {
    boss: 'alchimiste',
    steps: [
      { text: "Une potion nécessite 1,5 litre d'eau. Combien de millilitres cela fait-il ?", answer: 1500, unit: 'ml', hint: "1 litre = 1000 ml", explanation: "1.5 × 1000 = 1500 ml" },
      { text: "Si on divise en flacons de 250 ml, combien de flacons obtient-on ?", answer: 6, unit: 'flacons', hint: "1500 ÷ 250", explanation: "1500 ÷ 250 = 6 flacons" },
    ]
  },
  {
    boss: 'alchimiste',
    steps: [
      { text: "Un cours de magie dure 1h45. Il commence à 14h30. À quelle heure finit-il ? (format HHMM, ex: 1615)", answer: 1615, unit: '', hint: "14h30 + 1h45", explanation: "14h30 + 1h = 15h30, + 45min = 16h15" },
      { text: "Le sorcier fait 3 cours par jour avec 15 min de pause entre chaque. Combien de temps dure sa journée de travail en minutes ?", answer: 345, unit: 'min', hint: "3 × 105 min + 2 × 15 min", explanation: "3×105=315 min de cours + 2×15=30 min de pause = 345 min" },
    ]
  },

  // Kraken des Problèmes
  {
    boss: 'kraken',
    steps: [
      { text: "Un navire transporte 240 caisses. 1/3 sont déchargées au port A, puis 1/4 du reste au port B. Combien de caisses restent ?", answer: 120, unit: 'caisses', hint: "D'abord 240÷3, puis le reste ÷4", explanation: "Port A: 240÷3=80 déchargées, reste 160. Port B: 160÷4=40 déchargées, reste 120." },
      { text: "Chaque caisse pèse 15 kg. Quel est le poids total restant en kg ?", answer: 1800, unit: 'kg', hint: "120 × 15", explanation: "120 × 15 = 1800 kg" },
    ]
  },
  {
    boss: 'kraken',
    steps: [
      { text: "Un aquarium contient 5 poissons. Chaque mois, le nombre double. Combien de poissons après 4 mois ?", answer: 80, unit: '', hint: "5, 10, 20, ...", explanation: "Mois 1: 10, Mois 2: 20, Mois 3: 40, Mois 4: 80" },
      { text: "L'aquarium peut contenir 200 poissons maximum. Après combien de mois sera-t-il plein ? (en partant de 5)", answer: 6, unit: 'mois', hint: "Continue à doubler: 80, 160, ...", explanation: "Mois 5: 160, Mois 6: 320 > 200. Plein au mois 6." },
    ]
  },
];

/** Pick a random multi-step question for a given boss */
function getBossQuestion(bossId) {
  const pool = BOSS_QUESTIONS.filter(q => q.boss === bossId);
  return pick(pool);
}
```

**Step 2: Verify no syntax errors**

Run: `cd /c/Users/User/Claude/MathQuiz && python -c "import subprocess; r=subprocess.run(['node','-e','require(\"./js/questions.js\")'],capture_output=True,text=True); print(r.stderr or 'OK')"`

Note: Since this is browser JS (not CommonJS), just open `index.html` in browser or rely on Playwright tests. Alternatively, do a quick syntax check:

Run: `node -c js/questions.js` (syntax check only)

**Step 3: Commit**

```bash
git add js/questions.js
git commit -m "feat(v3): boss pool + multi-step boss questions (6 bosses, 14 encounters)"
```

---

## Task 2: Boss Themes in `themes.js`

**Files:**
- Modify: `js/themes.js` (add 2 boss-exclusive themes before the closing)

**Step 1: Add boss themes**

Add before the `FREE_THEMES` line in `themes.js`:

```js
  // === BOSS-EXCLUSIVE THEMES (not purchasable) ===
  boss_dragon: {
    id: 'boss_dragon',
    name: 'Antre du Dragon',
    price: -1, // not for sale
    rarity: 'legendary',
    preview: '🐉',
    vars: {
      '--bg-dark': '#1a0505',
      '--bg-card': '#2e0a0a',
      '--bg-card-hover': '#3d1212',
      '--text-primary': '#ffd0b0',
      '--text-secondary': '#c08060',
      '--accent-blue': '#ff6030',
      '--accent-green': '#ffb020',
      '--accent-orange': '#ff4500',
      '--accent-violet': '#ff6090',
      '--accent-red': '#ff2020',
      '--accent-yellow': '#ffa000'
    }
  },
  boss_kraken: {
    id: 'boss_kraken',
    name: 'Abysses',
    price: -1,
    rarity: 'legendary',
    preview: '🌀',
    vars: {
      '--bg-dark': '#050a1a',
      '--bg-card': '#0a1530',
      '--bg-card-hover': '#102048',
      '--text-primary': '#b0d0ff',
      '--text-secondary': '#6080b0',
      '--accent-blue': '#2060ff',
      '--accent-green': '#00d4aa',
      '--accent-orange': '#4090ff',
      '--accent-violet': '#6040ff',
      '--accent-red': '#3060c0',
      '--accent-yellow': '#40b0ff'
    }
  },
```

**Step 2: Update `renderShop` filter** — boss themes should NOT appear in shop. Currently the shop filters `t.price > 0`, and boss themes have `price: -1`, so they're already excluded. No change needed.

**Step 3: Commit**

```bash
git add js/themes.js
git commit -m "feat(v3): 2 boss-exclusive themes (Antre du Dragon, Abysses)"
```

---

## Task 3: Boss Progression — Loot, Badges, Contrat Bonuses in `progression.js`

**Files:**
- Modify: `js/progression.js` (append new functions at end)

**Step 1: Add boss loot application and contrat bonus functions**

Append to `progression.js`:

```js
// ─── Boss Fight Rewards ──────────────────────────────────────────────

/**
 * Apply boss loot reward based on boss definition.
 * Returns the loot item description for display.
 */
function applyBossLoot(boss) {
  const pm = ProfileManager;
  const item = { id: boss.lootId, name: boss.lootName, type: boss.lootType, boss: boss.id };

  switch (boss.lootType) {
    case 'theme': {
      const owned = pm.get('ownedThemes') || [];
      if (!owned.includes(boss.lootId)) {
        pm.set('ownedThemes', [...owned, boss.lootId]);
      }
      break;
    }
    case 'title': {
      const titles = pm.get('bossTitles') || [];
      if (!titles.includes(boss.lootId)) {
        pm.set('bossTitles', [...titles, boss.lootId]);
      }
      break;
    }
    case 'sticker': {
      const stickers = pm.get('ownedStickers') || [];
      if (!stickers.includes(boss.lootId)) {
        pm.set('ownedStickers', [...stickers, boss.lootId]);
      }
      break;
    }
    case 'badge': {
      const badges = pm.get('badges') || [];
      if (!badges.includes(boss.lootId)) {
        pm.set('badges', [...badges, boss.lootId]);
      }
      break;
    }
    case 'effect': {
      const effects = pm.get('bossEffects') || [];
      if (!effects.includes(boss.lootId)) {
        pm.set('bossEffects', [...effects, boss.lootId]);
      }
      break;
    }
  }

  return item;
}

/**
 * Calculate boss fight coin reward.
 * Victory: stake × 3 + flawless bonus (50 if no damage taken).
 * Defeat: 0 (stake already deducted before fight).
 */
function calculateBossReward(boss, playerHP, maxPlayerHP) {
  const baseReward = boss.stake * 3;
  const flawlessBonus = (playerHP === maxPlayerHP) ? 50 : 0;
  return { coins: baseReward + flawlessBonus, xp: baseReward, flawless: flawlessBonus > 0 };
}

// ─── Contrat d'Objectif ──────────────────────────────────────────────

/**
 * Generate 3 contract objectives based on recent stats.
 * @param {string} category - selected category ('all' or specific)
 * @param {string} difficulty - 'easy'|'medium'|'hard'
 * @param {number} questionCount - number of questions
 * @param {object} catStats - category stats from profile
 * @returns {Array} [{tier, label, conditions[], bonus, check(gameResult)}]
 */
function generateContracts(category, difficulty, questionCount, catStats) {
  // Calculate recent success rate
  const cats = category === 'all'
    ? Object.values(catStats)
    : [catStats[category] || { correct: 0, total: 0 }];
  const totalCorrect = cats.reduce((s, c) => s + (c.correct || 0), 0);
  const totalQuestions = cats.reduce((s, c) => s + (c.total || 0), 0);

  let recentRate;
  if (totalQuestions >= 10) {
    recentRate = totalCorrect / totalQuestions;
  } else {
    // Default rates when not enough data
    recentRate = difficulty === 'easy' ? 0.8 : difficulty === 'hard' ? 0.6 : 0.7;
  }

  // Calculate thresholds (number of correct answers needed)
  const bronzeRate = Math.max(0.2, recentRate - 0.1);
  const silverRate = recentRate;
  const goldRate = Math.min(1.0, recentRate + 0.15);

  const bronzeCount = Math.max(1, Math.round(bronzeRate * questionCount));
  const silverCount = Math.max(bronzeCount + 1, Math.round(silverRate * questionCount));
  const goldCount = Math.max(silverCount + 1, Math.min(questionCount, Math.round(goldRate * questionCount)));

  // Pick supplementary conditions
  const conditionPool = [
    { id: 'no_hint', label: 'sans indice', check: (r) => r.hintsUsed === 0 },
    { id: 'no_consec_wrong', label: 'sans 2 erreurs d\'affilée', check: (r) => r.maxConsecWrong < 2 },
    { id: 'one_fast', label: 'au moins 1 réponse rapide (< 10s)', check: (r) => r.fastAnswers >= 1 },
    { id: 'streak_3', label: 'série de 3 minimum', check: (r) => r.bestStreak >= 3 },
  ];

  // Shuffle and pick conditions
  const shuffled = conditionPool.sort(() => Math.random() - 0.5);
  const silverCondition = shuffled[0];
  const goldConditions = [shuffled[0], shuffled[1] || shuffled[0]];
  // Ensure gold always has "sans indice"
  if (!goldConditions.find(c => c.id === 'no_hint')) {
    goldConditions[1] = conditionPool.find(c => c.id === 'no_hint');
  }

  return [
    {
      tier: 'bronze',
      icon: '🥉',
      label: `${bronzeCount}/${questionCount} correct`,
      conditions: [],
      bonus: 10,
      check: (r) => r.correct >= bronzeCount,
    },
    {
      tier: 'silver',
      icon: '🥈',
      label: `${silverCount}/${questionCount} correct`,
      conditions: [silverCondition],
      bonus: 30,
      check: (r) => r.correct >= silverCount && silverCondition.check(r),
    },
    {
      tier: 'gold',
      icon: '🥇',
      label: `${goldCount}/${questionCount} correct`,
      conditions: goldConditions,
      bonus: 60,
      check: (r) => r.correct >= goldCount && goldConditions.every(c => c.check(r)),
    },
  ];
}
```

**Step 2: Syntax check**

Run: `node -c js/progression.js`

**Step 3: Commit**

```bash
git add js/progression.js
git commit -m "feat(v3): boss loot rewards + contrat d'objectif generator"
```

---

## Task 4: HTML Screens — Boss Appear, Boss Fight, Contrat

**Files:**
- Modify: `index.html` (add 3 new screen divs before the confetti canvas)

**Step 1: Add new screens**

Insert before `<canvas id="confetti-canvas">` (line 220):

```html
  <!-- ÉCRAN APPARITION BOSS -->
  <div id="screen-boss-appear" class="screen">
    <div class="boss-appear-card">
      <div id="boss-appear-emoji" class="boss-appear-emoji"></div>
      <h2 id="boss-appear-name"></h2>
      <p id="boss-appear-category" class="boss-appear-category"></p>
      <div class="boss-appear-stake">
        <span>Mise :</span>
        <span id="boss-appear-stake" class="boss-stake-amount"></span>
      </div>
      <div class="boss-appear-buttons">
        <button id="btn-boss-fight" class="btn-primary btn-boss-fight">⚔️ L'affronter !</button>
        <button id="btn-boss-later" class="btn-secondary">⏳ Plus tard</button>
      </div>
    </div>
  </div>

  <!-- ÉCRAN COMBAT BOSS -->
  <div id="screen-boss-fight" class="screen">
    <div class="boss-fight-header">
      <div class="hp-bar-container hp-player">
        <span class="hp-label">Toi</span>
        <div class="hp-bar">
          <div id="player-hp-fill" class="hp-fill hp-fill-player"></div>
        </div>
        <span id="player-hp-text" class="hp-text">3/3</span>
      </div>
      <div id="boss-fight-emoji" class="boss-fight-emoji"></div>
      <div class="hp-bar-container hp-boss">
        <span id="boss-fight-name" class="hp-label"></span>
        <div class="hp-bar">
          <div id="boss-hp-fill" class="hp-fill hp-fill-boss"></div>
        </div>
        <span id="boss-hp-text" class="hp-text">5/5</span>
      </div>
    </div>

    <div id="boss-phase-label" class="boss-phase-label">Phase 1 — Assaut</div>

    <div id="boss-question-card" class="question-card">
      <span id="boss-category-badge" class="category-badge"></span>
      <p id="boss-question-text" class="question-text"></p>
      <p id="boss-question-unit" class="question-unit"></p>

      <div id="boss-timer-bar" class="boss-timer-bar">
        <div id="boss-timer-fill" class="boss-timer-fill"></div>
      </div>

      <div id="boss-answer-section" class="answer-section">
        <input type="number" id="boss-answer-input" class="answer-input" placeholder="Ta réponse...">
        <button id="btn-boss-validate" class="btn-primary">Valider</button>
      </div>

      <div id="boss-feedback-section" class="feedback-section" style="display:none">
        <p id="boss-feedback-result" class="feedback-result"></p>
        <p id="boss-feedback-explanation" class="feedback-explanation"></p>
        <button id="btn-boss-next" class="btn-primary">Suivant</button>
      </div>
    </div>
  </div>

  <!-- ÉCRAN FIN BOSS -->
  <div id="screen-boss-end" class="screen">
    <div id="boss-end-emoji" class="boss-appear-emoji"></div>
    <h2 id="boss-end-title"></h2>
    <p id="boss-end-message" class="boss-end-message"></p>
    <div id="boss-end-rewards" class="rewards-section"></div>
    <div id="boss-end-loot" class="boss-loot-reveal"></div>
    <button id="btn-boss-end-close" class="btn-primary">Continuer</button>
  </div>

  <!-- ÉCRAN CONTRAT D'OBJECTIF -->
  <div id="screen-contract" class="screen">
    <h2>🎯 Choisis ton défi !</h2>
    <div id="contract-options" class="contract-options"></div>
    <button id="btn-no-contract" class="btn-secondary btn-no-contract">Jouer sans contrat</button>
  </div>
```

**Step 2: Commit**

```bash
git add index.html
git commit -m "feat(v3): HTML screens for boss appear/fight/end + contrat"
```

---

## Task 5: CSS — Boss Fight & Contrat UI

**Files:**
- Modify: `css/style.css` (append new sections at end)

**Step 1: Add boss fight and contrat styles**

Append to `css/style.css`:

```css
/* ══════════════════════════════════════════════════════════════════════
   V3 — BOSS FIGHTS
   ══════════════════════════════════════════════════════════════════════ */

/* Boss Appear Screen */
.boss-appear-card {
  text-align: center;
  padding: 2rem;
  animation: bossAppear 0.6s ease-out;
}

@keyframes bossAppear {
  0% { transform: scale(0.3); opacity: 0; }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

.boss-appear-emoji {
  font-size: 5rem;
  margin-bottom: 0.5rem;
  animation: bossPulse 1.5s ease-in-out infinite;
}

@keyframes bossPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.boss-appear-category {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.boss-appear-stake {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  margin: 1.5rem 0;
  color: var(--accent-yellow);
}

.boss-stake-amount {
  font-weight: 700;
  font-size: 1.4rem;
}

.boss-appear-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-boss-fight {
  font-size: 1.2rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, var(--accent-red), var(--accent-orange));
  animation: fightPulse 2s ease-in-out infinite;
}

@keyframes fightPulse {
  0%, 100% { box-shadow: 0 0 10px rgba(255, 100, 50, 0.3); }
  50% { box-shadow: 0 0 25px rgba(255, 100, 50, 0.6); }
}

/* Boss Fight Screen */
.boss-fight-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--bg-card);
  border-radius: 12px;
  margin-bottom: 1rem;
}

.hp-bar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.hp-bar-container.hp-boss {
  text-align: right;
}

.hp-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.hp-bar {
  width: 100%;
  height: 12px;
  background: rgba(255,255,255,0.1);
  border-radius: 6px;
  overflow: hidden;
}

.hp-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.5s ease;
}

.hp-fill-player {
  background: linear-gradient(90deg, #4ecdc4, #44b09e);
}

.hp-fill-boss {
  background: linear-gradient(90deg, #ff6b6b, #ff4040);
  float: right;
}

.hp-text {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.boss-fight-emoji {
  font-size: 2.5rem;
  margin: 0 0.5rem;
  transition: transform 0.3s ease;
}

.boss-fight-emoji.hit {
  animation: bossHit 0.4s ease;
}

.boss-fight-emoji.attack {
  animation: bossAttack 0.5s ease;
}

@keyframes bossHit {
  0% { transform: scale(1); }
  30% { transform: scale(0.8) rotate(-10deg); }
  100% { transform: scale(1) rotate(0deg); }
}

@keyframes bossAttack {
  0% { transform: scale(1); }
  40% { transform: scale(1.3) rotate(5deg); }
  100% { transform: scale(1); }
}

.boss-phase-label {
  text-align: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--accent-orange);
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Boss Timer Bar */
.boss-timer-bar {
  width: 100%;
  height: 6px;
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
  margin: 0.75rem 0;
  overflow: hidden;
}

.boss-timer-fill {
  height: 100%;
  background: var(--accent-green);
  border-radius: 3px;
  transition: width 0.1s linear, background-color 0.3s;
  width: 100%;
}

.boss-timer-fill.warning {
  background: var(--accent-orange);
}

.boss-timer-fill.danger {
  background: var(--accent-red);
}

/* Boss End Screen */
.boss-end-message {
  text-align: center;
  color: var(--text-secondary);
  margin: 0.5rem 0 1.5rem;
}

.boss-loot-reveal {
  text-align: center;
  padding: 1.5rem;
  background: var(--bg-card);
  border-radius: 12px;
  margin: 1rem 0;
  border: 2px solid var(--accent-yellow);
}

.boss-loot-reveal .loot-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.5rem;
}

.boss-loot-reveal .loot-name {
  font-weight: 700;
  color: var(--accent-yellow);
  font-size: 1.1rem;
}

.boss-loot-reveal .loot-label {
  color: var(--text-secondary);
  font-size: 0.8rem;
}

/* Boss icon on home screen */
.boss-waiting-icon {
  position: fixed;
  bottom: 5rem;
  right: 1rem;
  font-size: 2.5rem;
  cursor: pointer;
  animation: bossPulse 1.5s ease-in-out infinite;
  z-index: 10;
  filter: drop-shadow(0 0 8px rgba(255, 100, 50, 0.5));
}

/* ══════════════════════════════════════════════════════════════════════
   V3 — CONTRAT D'OBJECTIF
   ══════════════════════════════════════════════════════════════════════ */

.contract-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1.5rem 0;
}

.contract-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--bg-card);
  border-radius: 12px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s, transform 0.15s;
}

.contract-card:hover {
  border-color: var(--accent-blue);
  transform: translateY(-2px);
}

.contract-card:active {
  transform: translateY(0);
}

.contract-card[data-tier="bronze"] { border-left: 4px solid #cd7f32; }
.contract-card[data-tier="silver"] { border-left: 4px solid #c0c0c0; }
.contract-card[data-tier="gold"]   { border-left: 4px solid #ffd700; }

.contract-icon {
  font-size: 2rem;
}

.contract-info {
  flex: 1;
}

.contract-title {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.contract-conditions {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.contract-bonus {
  font-weight: 700;
  color: var(--accent-yellow);
  font-size: 1rem;
  white-space: nowrap;
}

.btn-no-contract {
  width: 100%;
  margin-top: 0.5rem;
  opacity: 0.7;
}

/* Contract indicator during game */
.contract-indicator {
  text-align: center;
  font-size: 0.75rem;
  padding: 0.3rem 0.75rem;
  background: var(--bg-card);
  border-radius: 8px;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.contract-indicator .contract-tier-icon {
  margin-right: 0.3rem;
}

/* Contract result on end screen */
.contract-result {
  text-align: center;
  padding: 0.75rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  font-weight: 600;
}

.contract-result.success {
  background: rgba(78, 205, 196, 0.15);
  color: var(--accent-green);
  border: 1px solid var(--accent-green);
}

.contract-result.failure {
  background: rgba(255,255,255,0.05);
  color: var(--text-secondary);
}
```

**Step 2: Commit**

```bash
git add css/style.css
git commit -m "feat(v3): CSS for boss fight UI + contrat d'objectif"
```

---

## Task 6: App Logic — Boss Fight System in `app.js`

This is the largest task. It adds the boss fight state machine, boss trigger logic, and boss fight screen interactions.

**Files:**
- Modify: `js/app.js`

**Step 1: Add boss state to the state object**

After `activeBoost: null,` (line 68), add:

```js
  // V3 — Boss Fight
  bossState: null, // null | { boss, phase, questionIndex, playerHP, bossHP, maxPlayerHP, maxBossHP, questions, criticalHits, currentStepIndex, bossQuestion }
  pendingBoss: null, // null | boss object waiting to be fought
  gamesSinceBoss: 0,
  // V3 — Contrat
  activeContract: null, // null | {tier, label, conditions, bonus, check}
  contractGameResult: null, // {correct, hintsUsed, maxConsecWrong, fastAnswers, bestStreak}
```

**Step 2: Add boss persistence helpers**

After `clearGameState()` function (around line 114), add:

```js
// ── Boss Persistence ──────────────────────────────────────────────────
function loadBossState() {
  state.pendingBoss = ProfileManager.get('pendingBoss', null);
  state.gamesSinceBoss = ProfileManager.get('gamesSinceBoss', 0);
  if (state.pendingBoss) {
    // Reconstruct boss object from BOSS_POOL
    const full = BOSS_POOL.find(b => b.id === state.pendingBoss.id);
    if (full) state.pendingBoss = full;
    else state.pendingBoss = null;
  }
}

function saveBossState() {
  ProfileManager.set('pendingBoss', state.pendingBoss ? { id: state.pendingBoss.id } : null);
  ProfileManager.set('gamesSinceBoss', state.gamesSinceBoss);
}
```

**Step 3: Add boss trigger logic**

After `saveBossState()`, add:

```js
// ── Boss Trigger ──────────────────────────────────────────────────────
function shouldTriggerBoss() {
  if (state.pendingBoss) return false; // already one waiting
  const g = state.gamesSinceBoss;
  if (g <= 0) return false;
  if (g >= 15) return true;
  let prob = 0;
  if (g >= 11) prob = 0.20;
  else if (g >= 6) prob = 0.10;
  else if (g >= 2) prob = 0.05;
  return Math.random() < prob;
}

function pickBoss() {
  const defeated = ProfileManager.get('defeatedBosses', []);
  const lastBossCat = ProfileManager.get('lastBossCategory', null);

  // Prefer undefeated bosses
  let candidates = BOSS_POOL.filter(b => !defeated.includes(b.id));
  if (candidates.length === 0) {
    // All defeated — offer "enraged" versions (same bosses, harder)
    candidates = BOSS_POOL;
  }

  // Avoid same category as last boss
  if (lastBossCat && candidates.length > 1) {
    const filtered = candidates.filter(b => b.category !== lastBossCat);
    if (filtered.length > 0) candidates = filtered;
  }

  return pick(candidates);
}

function triggerBoss() {
  const boss = pickBoss();
  state.pendingBoss = boss;
  state.gamesSinceBoss = 0;
  saveBossState();
  showBossAppear(boss);
}
```

**Step 4: Add boss appear screen logic**

```js
// ── Boss Appear Screen ────────────────────────────────────────────────
function showBossAppear(boss) {
  const coins = ProfileManager.get('coins', 0);
  document.getElementById('boss-appear-emoji').textContent = boss.emoji;
  document.getElementById('boss-appear-name').textContent = boss.name;
  document.getElementById('boss-appear-category').textContent = CATEGORIES[boss.category]?.label || boss.category;
  document.getElementById('boss-appear-stake').textContent = boss.stake + ' 🪙';

  const fightBtn = document.getElementById('btn-boss-fight');
  if (coins < boss.stake) {
    fightBtn.textContent = `Pas assez de pièces (${coins}/${boss.stake} 🪙)`;
    fightBtn.disabled = true;
  } else {
    fightBtn.textContent = '⚔️ L\'affronter !';
    fightBtn.disabled = false;
  }

  showScreen('screen-boss-appear');
}

document.getElementById('btn-boss-fight').addEventListener('click', () => {
  if (!state.pendingBoss) return;
  startBossFight(state.pendingBoss);
});

document.getElementById('btn-boss-later').addEventListener('click', () => {
  // Boss stays pending, go home
  saveBossState();
  updateProfileHeader();
  renderBossWaitingIcon();
  showScreen('screen-home');
});
```

**Step 5: Add boss fight core logic**

```js
// ── Boss Fight Core ───────────────────────────────────────────────────
function startBossFight(boss) {
  // Deduct stake
  const coins = ProfileManager.get('coins', 0);
  ProfileManager.set('coins', coins - boss.stake);

  const defeated = ProfileManager.get('defeatedBosses', []);
  const isEnraged = defeated.includes(boss.id);
  const maxPlayerHP = 3;
  const maxBossHP = isEnraged ? boss.hp + 2 : boss.hp;

  // Generate 3 phase-1 questions (boss category, elevated difficulty)
  const subLevel = Math.min(3, getSubLevel() + 1);
  const phase1Questions = [];
  let lastCat = null;
  for (let i = 0; i < 3; i++) {
    const q = generateQuestion(boss.category, subLevel, lastCat);
    phase1Questions.push(q);
    lastCat = q.category;
  }

  // Get multi-step question for phase 2
  const bossQ = getBossQuestion(boss.id);

  state.bossState = {
    boss,
    isEnraged,
    phase: 1, // 1 = assault, 2 = final blow
    questionIndex: 0,
    playerHP: maxPlayerHP,
    bossHP: maxBossHP,
    maxPlayerHP,
    maxBossHP,
    questions: phase1Questions,
    bossQuestion: bossQ,
    currentStepIndex: 0,
    criticalHits: 0,
    answered: false,
    timerInterval: null,
    timerStart: 0,
    timerDuration: 0,
  };

  showScreen('screen-boss-fight');
  updateBossHP();
  showBossPhaseLabel();
  showBossQuestion();
}

function updateBossHP() {
  const bs = state.bossState;
  const playerPct = (bs.playerHP / bs.maxPlayerHP) * 100;
  const bossPct = (bs.bossHP / bs.maxBossHP) * 100;
  document.getElementById('player-hp-fill').style.width = playerPct + '%';
  document.getElementById('player-hp-text').textContent = bs.playerHP + '/' + bs.maxPlayerHP;
  document.getElementById('boss-hp-fill').style.width = bossPct + '%';
  document.getElementById('boss-hp-text').textContent = Math.max(0, bs.bossHP) + '/' + bs.maxBossHP;
  document.getElementById('boss-fight-emoji').textContent = bs.boss.emoji;
  document.getElementById('boss-fight-name').textContent = bs.boss.name;
}

function showBossPhaseLabel() {
  const bs = state.bossState;
  const label = document.getElementById('boss-phase-label');
  if (bs.phase === 1) {
    label.textContent = `Phase 1 — Assaut (${bs.questionIndex + 1}/3)`;
  } else {
    label.textContent = `⚔️ COUP FATAL — Étape ${bs.currentStepIndex + 1}/${bs.bossQuestion.steps.length}`;
  }
}

function showBossQuestion() {
  const bs = state.bossState;
  bs.answered = false;

  let q;
  let timerDuration;

  if (bs.phase === 1) {
    q = bs.questions[bs.questionIndex];
    timerDuration = bs.isEnraged ? 12 : 15; // seconds
  } else {
    const step = bs.bossQuestion.steps[bs.currentStepIndex];
    q = step;
    timerDuration = 30;
  }

  const badge = document.getElementById('boss-category-badge');
  const catInfo = CATEGORIES[q.category || bs.boss.category];
  badge.textContent = catInfo ? catInfo.label : '';
  badge.setAttribute('data-cat', q.category || bs.boss.category);
  document.getElementById('boss-question-card').setAttribute('data-cat', q.category || bs.boss.category);

  document.getElementById('boss-question-text').textContent = q.text;
  document.getElementById('boss-question-unit').textContent = q.unit ? 'Réponse en ' + q.unit : '';

  document.getElementById('boss-answer-section').style.display = '';
  document.getElementById('boss-feedback-section').style.display = 'none';

  const input = document.getElementById('boss-answer-input');
  input.value = '';
  input.type = q.textAnswer !== undefined ? 'text' : 'number';
  input.placeholder = 'Ta réponse...';

  // Start timer
  startBossTimer(timerDuration);

  const card = document.getElementById('boss-question-card');
  card.classList.remove('slide-in');
  void card.offsetWidth;
  card.classList.add('slide-in');

  setTimeout(() => input.focus(), 100);
}

function startBossTimer(seconds) {
  const bs = state.bossState;
  stopBossTimer();
  bs.timerStart = Date.now();
  bs.timerDuration = seconds * 1000;

  const fill = document.getElementById('boss-timer-fill');
  fill.style.width = '100%';
  fill.className = 'boss-timer-fill';

  bs.timerInterval = setInterval(() => {
    const elapsed = Date.now() - bs.timerStart;
    const remaining = Math.max(0, 1 - elapsed / bs.timerDuration);
    fill.style.width = (remaining * 100) + '%';

    if (remaining < 0.25) fill.className = 'boss-timer-fill danger';
    else if (remaining < 0.5) fill.className = 'boss-timer-fill warning';

    if (remaining <= 0) {
      stopBossTimer();
      // Time's up = wrong answer
      handleBossAnswer(true);
    }
  }, 50);
}

function stopBossTimer() {
  const bs = state.bossState;
  if (bs && bs.timerInterval) {
    clearInterval(bs.timerInterval);
    bs.timerInterval = null;
  }
}

function handleBossAnswer(timedOut) {
  const bs = state.bossState;
  if (bs.answered) return;
  bs.answered = true;
  stopBossTimer();

  let q, isCorrect;
  const elapsed = (Date.now() - bs.timerStart) / 1000;
  const input = document.getElementById('boss-answer-input');
  const userAnswer = timedOut ? '' : input.value.trim();

  if (bs.phase === 1) {
    q = bs.questions[bs.questionIndex];
  } else {
    q = bs.bossQuestion.steps[bs.currentStepIndex];
  }

  if (timedOut) {
    isCorrect = false;
  } else if (q.textAnswer !== undefined) {
    isCorrect = userAnswer.toLowerCase() === q.textAnswer.toLowerCase();
  } else {
    isCorrect = parseFloat(userAnswer) === q.answer;
  }

  const isCritical = isCorrect && elapsed < (bs.timerDuration / 2000);
  const emoji = document.getElementById('boss-fight-emoji');

  if (isCorrect) {
    const damage = isCritical ? 2 : 1;
    bs.bossHP = Math.max(0, bs.bossHP - damage);
    if (isCritical) bs.criticalHits++;
    emoji.classList.remove('hit');
    void emoji.offsetWidth;
    emoji.classList.add('hit');
    launchMiniConfetti();
  } else {
    if (bs.phase === 1) {
      bs.playerHP--;
      emoji.classList.remove('attack');
      void emoji.offsetWidth;
      emoji.classList.add('attack');
    }
    // Phase 2: wrong step = less damage but no player HP loss
    // (answer is revealed, continue)
  }

  updateBossHP();

  // Show feedback
  const feedbackResult = document.getElementById('boss-feedback-result');
  const feedbackExplanation = document.getElementById('boss-feedback-explanation');

  if (isCorrect) {
    feedbackResult.textContent = isCritical ? 'CRITIQUE ! Dégâts ×2 !' : 'Correct ! Touché !';
    feedbackResult.className = 'feedback-result correct';
  } else {
    const correctAnswer = q.textAnswer !== undefined ? q.textAnswer : q.answer;
    feedbackResult.textContent = timedOut
      ? 'Temps écoulé ! La réponse était ' + correctAnswer
      : 'Incorrect — la réponse était ' + correctAnswer;
    feedbackResult.className = 'feedback-result incorrect';
  }
  feedbackExplanation.textContent = q.explanation || '';

  document.getElementById('boss-answer-section').style.display = 'none';
  document.getElementById('boss-feedback-section').style.display = '';

  // Check for fight end conditions
  if (bs.playerHP <= 0) {
    document.getElementById('btn-boss-next').textContent = 'Défaite...';
  } else if (bs.bossHP <= 0) {
    document.getElementById('btn-boss-next').textContent = 'Victoire !';
  } else {
    document.getElementById('btn-boss-next').textContent = 'Suivant';
  }
}

document.getElementById('btn-boss-validate').addEventListener('click', () => handleBossAnswer(false));
document.getElementById('boss-answer-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleBossAnswer(false);
});

document.getElementById('btn-boss-next').addEventListener('click', () => {
  const bs = state.bossState;
  if (!bs) return;

  // Check end conditions
  if (bs.playerHP <= 0) {
    endBossFight(false);
    return;
  }
  if (bs.bossHP <= 0) {
    endBossFight(true);
    return;
  }

  if (bs.phase === 1) {
    bs.questionIndex++;
    if (bs.questionIndex >= 3) {
      // Transition to phase 2
      bs.phase = 2;
      bs.currentStepIndex = 0;
    }
  } else {
    bs.currentStepIndex++;
    if (bs.currentStepIndex >= bs.bossQuestion.steps.length) {
      // All steps done — boss survives if still has HP
      if (bs.bossHP > 0) {
        endBossFight(false);
        return;
      } else {
        endBossFight(true);
        return;
      }
    }
  }

  showBossPhaseLabel();
  showBossQuestion();
});

function endBossFight(victory) {
  stopBossTimer();
  const bs = state.bossState;
  const boss = bs.boss;

  document.getElementById('boss-end-emoji').textContent = boss.emoji;

  if (victory) {
    document.getElementById('boss-end-title').textContent = 'Victoire !';
    document.getElementById('boss-end-message').textContent = boss.name + ' est vaincu !';

    const reward = calculateBossReward(boss, bs.playerHP, bs.maxPlayerHP);
    ProfileManager.set('coins', ProfileManager.get('coins', 0) + reward.coins);
    ProfileManager.set('xp', ProfileManager.get('xp', 0) + reward.xp);

    // Track defeated boss
    const defeated = ProfileManager.get('defeatedBosses', []);
    if (!defeated.includes(boss.id)) defeated.push(boss.id);
    ProfileManager.set('defeatedBosses', defeated);
    ProfileManager.set('lastBossCategory', boss.category);

    // Apply loot
    const loot = applyBossLoot(boss);

    // Display rewards
    let rewardsHtml = `<div class="reward-row"><span>Pièces gagnées</span><span class="reward-value">+${reward.coins} 🪙</span></div>`;
    rewardsHtml += `<div class="reward-row"><span>XP gagnés</span><span class="reward-value">+${reward.xp} XP</span></div>`;
    if (reward.flawless) {
      rewardsHtml += `<div class="reward-row"><span>🛡️ Sans égratignure !</span><span class="reward-value">+50 🪙 bonus</span></div>`;
    }
    document.getElementById('boss-end-rewards').innerHTML = rewardsHtml;

    // Display loot
    const lootIcon = boss.lootType === 'theme' ? THEMES[boss.lootId]?.preview || '🎁'
                   : boss.lootType === 'sticker' ? '🏷️'
                   : boss.lootType === 'badge' ? '🏅'
                   : boss.lootType === 'effect' ? '✨'
                   : '🏆';
    document.getElementById('boss-end-loot').innerHTML = `
      <span class="loot-label">Loot exclusif !</span>
      <span class="loot-icon">${lootIcon}</span>
      <span class="loot-name">${boss.lootName}</span>
    `;
    document.getElementById('boss-end-loot').style.display = '';

    // Check boss badges
    checkBossBadges(bs);

    launchBigConfetti();
  } else {
    document.getElementById('boss-end-title').textContent = 'Défaite...';
    document.getElementById('boss-end-message').textContent = boss.name + ' a gagné cette fois. Il reviendra... prépare-toi !';
    document.getElementById('boss-end-rewards').innerHTML = `<div class="reward-row"><span>Mise perdue</span><span class="reward-value" style="color:var(--accent-red)">−${boss.stake} 🪙</span></div>`;
    document.getElementById('boss-end-loot').style.display = 'none';
  }

  // Clear pending boss
  state.pendingBoss = null;
  state.gamesSinceBoss = 0;
  saveBossState();

  state.bossState = null;
  showScreen('screen-boss-end');
}

function checkBossBadges(bs) {
  const badges = ProfileManager.get('badges', []);
  const newBadges = [];

  // First Victory
  if (!badges.includes('boss_first_win')) {
    badges.push('boss_first_win');
    newBadges.push({ icon: '⚔️', name: 'Première Victoire' });
  }

  // Boss Slayer (all 6 defeated)
  const defeated = ProfileManager.get('defeatedBosses', []);
  if (defeated.length >= 6 && !badges.includes('boss_slayer')) {
    badges.push('boss_slayer');
    newBadges.push({ icon: '🗡️', name: 'Tueur de Boss' });
  }

  // Flawless
  if (bs.playerHP === bs.maxPlayerHP && !badges.includes('boss_flawless')) {
    badges.push('boss_flawless');
    newBadges.push({ icon: '🛡️', name: 'Sans Égratignure' });
  }

  // Critical master
  if (bs.criticalHits >= 3 && !badges.includes('boss_critical')) {
    badges.push('boss_critical');
    newBadges.push({ icon: '💥', name: 'Critique !' });
  }

  // Dragon Enraged (hidden)
  if (bs.isEnraged && bs.boss.id === 'dragon' && !badges.includes('boss_dragon_enraged')) {
    badges.push('boss_dragon_enraged');
    newBadges.push({ icon: '🐉', name: 'Chasseur de Dragons' });
  }

  ProfileManager.set('badges', badges);

  // Show badge toast if any
  if (newBadges.length > 0) {
    const rewardsEl = document.getElementById('boss-end-rewards');
    newBadges.forEach(b => {
      rewardsEl.innerHTML += `<div class="reward-row"><span>${b.icon} Badge !</span><span class="reward-value">${b.name}</span></div>`;
    });
  }
}

document.getElementById('btn-boss-end-close').addEventListener('click', () => {
  updateProfileHeader();
  renderRecords();
  renderBossWaitingIcon();
  showScreen('screen-home');
});
```

**Step 6: Add boss waiting icon on home screen**

```js
// ── Boss Waiting Icon (home screen) ───────────────────────────────────
function renderBossWaitingIcon() {
  let icon = document.getElementById('boss-waiting-icon');
  if (state.pendingBoss) {
    if (!icon) {
      icon = document.createElement('div');
      icon.id = 'boss-waiting-icon';
      icon.className = 'boss-waiting-icon';
      document.getElementById('screen-home').appendChild(icon);
    }
    icon.textContent = state.pendingBoss.emoji;
    icon.style.display = '';
    icon.onclick = () => showBossAppear(state.pendingBoss);
  } else if (icon) {
    icon.style.display = 'none';
  }
}
```

**Step 7: Integrate boss trigger into endGame flow**

In `endGame()` function, after `showScreen('screen-end');` (the last line of endGame), add the boss trigger check. Find the `showScreen('screen-end');` line and **replace it** with:

```js
  showScreen('screen-end');

  // V3: Check boss trigger after game
  state.gamesSinceBoss++;
  saveBossState();
```

Then modify the `btn-menu` click handler. Replace the current handler:

```js
document.getElementById('btn-menu').addEventListener('click', () => {
  if (state.pendingChests && state.pendingChests.length > 0) {
    showChest(state.pendingChests.shift());
  } else {
    updateProfileHeader();
    renderRecords();
    // V3: Check for boss trigger
    if (shouldTriggerBoss()) {
      triggerBoss();
    } else {
      renderBossWaitingIcon();
      showScreen('screen-home');
    }
  }
});
```

Similarly, update `btn-replay`:

```js
document.getElementById('btn-replay').addEventListener('click', () => {
  if (state.pendingChests && state.pendingChests.length > 0) {
    state.replayAfterChests = true;
    showChest(state.pendingChests.shift());
  } else {
    // V3: Check for boss trigger before replay
    if (shouldTriggerBoss()) {
      triggerBoss();
    } else {
      startGame();
    }
  }
});
```

**Step 8: Load boss state on profile selection**

In `selectProfile()` function, after `loadProfileData();` add:

```js
  loadBossState();
```

And after the `showScreen('screen-home');` at the end of selectProfile (the else branch), add:

```js
  renderBossWaitingIcon();
```

**Step 9: Commit**

```bash
git add js/app.js
git commit -m "feat(v3): boss fight system — trigger, combat, rewards, badges"
```

---

## Task 7: App Logic — Contrat d'Objectif in `app.js`

**Files:**
- Modify: `js/app.js`

**Step 1: Add contrat flow between config and game start**

Replace the btn-play click handler (`document.getElementById('btn-play').addEventListener('click', startGame);`) with:

```js
document.getElementById('btn-play').addEventListener('click', () => {
  // V3: Show contract selection before starting game
  showContractScreen();
});
```

Add the contract screen logic:

```js
// ── Contrat d'Objectif ────────────────────────────────────────────────
function showContractScreen() {
  const contracts = generateContracts(
    state.category,
    state.difficulty,
    state.questionCount,
    state.categoryStats
  );

  const container = document.getElementById('contract-options');
  container.innerHTML = contracts.map(c => {
    const condText = c.conditions.length > 0
      ? c.conditions.map(cond => cond.label).join(' + ')
      : '';
    return `<div class="contract-card" data-tier="${c.tier}">
      <span class="contract-icon">${c.icon}</span>
      <div class="contract-info">
        <div class="contract-title">${c.label}</div>
        <div class="contract-conditions">${condText}</div>
      </div>
      <span class="contract-bonus">+${c.bonus} 🪙</span>
    </div>`;
  }).join('');

  // Store contracts for reference
  state._contracts = contracts;

  container.querySelectorAll('.contract-card').forEach(card => {
    card.addEventListener('click', () => {
      const tier = card.dataset.tier;
      state.activeContract = contracts.find(c => c.tier === tier);
      state.contractGameResult = {
        correct: 0,
        hintsUsed: 0,
        maxConsecWrong: 0,
        _consecWrong: 0,
        fastAnswers: 0,
        bestStreak: 0,
        _currentStreak: 0,
      };
      startGame();
    });
  });

  document.getElementById('btn-no-contract').onclick = () => {
    state.activeContract = null;
    state.contractGameResult = null;
    startGame();
  };

  showScreen('screen-contract');
}
```

**Step 2: Track contract metrics during gameplay**

In `validateAnswer()`, after the correct/incorrect logic blocks (after updating categoryStats), add:

```js
  // V3: Track contract metrics
  if (state.contractGameResult) {
    const cr = state.contractGameResult;
    if (isCorrect) {
      cr.correct++;
      cr._currentStreak++;
      if (cr._currentStreak > cr.bestStreak) cr.bestStreak = cr._currentStreak;
      if (elapsed < 10) cr.fastAnswers++;
      cr._consecWrong = 0;
    } else {
      cr._currentStreak = 0;
      cr._consecWrong++;
      if (cr._consecWrong > cr.maxConsecWrong) cr.maxConsecWrong = cr._consecWrong;
    }
    if (state.hintUsed) cr.hintsUsed++;
  }
```

**Step 3: Show contract indicator during game**

In `showQuestion()`, after updating the question counter display, add:

```js
  // V3: Show contract indicator
  let contractIndicator = document.getElementById('contract-indicator');
  if (state.activeContract) {
    if (!contractIndicator) {
      contractIndicator = document.createElement('div');
      contractIndicator.id = 'contract-indicator';
      contractIndicator.className = 'contract-indicator';
      document.querySelector('.game-header').after(contractIndicator);
    }
    contractIndicator.innerHTML = `<span class="contract-tier-icon">${state.activeContract.icon}</span> Contrat : ${state.activeContract.label}`;
    contractIndicator.style.display = '';
  } else if (contractIndicator) {
    contractIndicator.style.display = 'none';
  }
```

**Step 4: Evaluate contract at end of game**

In `endGame()`, before the final `showScreen('screen-end');` line, add:

```js
  // V3: Evaluate contract
  if (state.activeContract && state.contractGameResult) {
    const contractMet = state.activeContract.check(state.contractGameResult);
    const contractEl = document.createElement('div');
    contractEl.className = 'contract-result ' + (contractMet ? 'success' : 'failure');

    if (contractMet) {
      const bonus = state.activeContract.bonus;
      ProfileManager.set('coins', ProfileManager.get('coins', 0) + bonus);
      contractEl.textContent = `${state.activeContract.icon} Contrat ${state.activeContract.tier === 'gold' ? 'Or' : state.activeContract.tier === 'silver' ? 'Argent' : 'Bronze'} rempli ! +${bonus} 🪙`;

      // Track for badges
      const contractsCompleted = ProfileManager.get('contractsCompleted', { bronze: 0, silver: 0, gold: 0, goldStreak: 0 });
      contractsCompleted[state.activeContract.tier]++;
      if (state.activeContract.tier === 'gold') {
        contractsCompleted.goldStreak++;
      } else {
        contractsCompleted.goldStreak = 0;
      }
      ProfileManager.set('contractsCompleted', contractsCompleted);

      // Contract badges
      checkContractBadges(contractsCompleted);
    } else {
      contractEl.textContent = `${state.activeContract.icon} Contrat non rempli — la prochaine fois !`;
      const contractsCompleted = ProfileManager.get('contractsCompleted', { bronze: 0, silver: 0, gold: 0, goldStreak: 0 });
      contractsCompleted.goldStreak = 0;
      ProfileManager.set('contractsCompleted', contractsCompleted);
    }

    // Insert before rewards section
    const rewardsSection = document.getElementById('rewards-section');
    const existing = document.querySelector('.contract-result');
    if (existing) existing.remove();
    rewardsSection.parentNode.insertBefore(contractEl, rewardsSection);

    state.activeContract = null;
    state.contractGameResult = null;
  }
```

**Step 5: Add contract badge checking**

```js
function checkContractBadges(stats) {
  const badges = ProfileManager.get('badges', []);
  const newBadges = [];

  const total = stats.bronze + stats.silver + stats.gold;
  if (total >= 1 && !badges.includes('contract_first')) {
    badges.push('contract_first');
    newBadges.push({ icon: '🎯', name: 'Premier Contrat' });
  }

  if (stats.gold >= 10 && !badges.includes('contract_gold_hunter')) {
    badges.push('contract_gold_hunter');
    newBadges.push({ icon: '🥇', name: 'Chasseur d\'Or' });
  }

  if (stats.goldStreak >= 5 && !badges.includes('contract_perfectionist')) {
    badges.push('contract_perfectionist');
    newBadges.push({ icon: '✨', name: 'Perfectionniste' });
  }

  // Hidden: 20 bronze contracts
  if (stats.bronze >= 20 && !badges.includes('contract_all_bronze')) {
    badges.push('contract_all_bronze');
    newBadges.push({ icon: '🥉', name: 'Tout Bronze' });
  }

  if (newBadges.length > 0) {
    ProfileManager.set('badges', badges);
    state.badgesUnlocked.push(...newBadges);
  }
}
```

**Step 6: Commit**

```bash
git add js/app.js
git commit -m "feat(v3): contrat d'objectif — selection, tracking, evaluation, badges"
```

---

## Task 8: Add Boss & Contract Badge Definitions to BADGE_DEFS

**Files:**
- Modify: `js/app.js` (in BADGE_DEFS array)

**Step 1: Add boss and contract badge definitions**

After the hidden badges section in `BADGE_DEFS`, before the real-life badges, add:

```js
  // ═══ BOSS BADGES ═══
  { id: 'boss_first_win', name: 'Première Victoire', icon: '⚔️', category: 'boss',
    check: () => (ProfileManager.get('defeatedBosses', []).length >= 1),
    progress: () => ({ cur: Math.min(ProfileManager.get('defeatedBosses', []).length, 1), max: 1 }) },
  { id: 'boss_slayer', name: 'Tueur de Boss', icon: '🗡️', category: 'boss',
    check: () => (ProfileManager.get('defeatedBosses', []).length >= 6),
    progress: () => ({ cur: Math.min(ProfileManager.get('defeatedBosses', []).length, 6), max: 6 }) },
  { id: 'boss_flawless', name: 'Sans Égratignure', icon: '🛡️', category: 'boss',
    check: () => false, hint: 'Bats un boss sans perdre de PV' },
  { id: 'boss_critical', name: 'Critique !', icon: '💥', category: 'boss',
    check: () => false, hint: '3 réponses critiques dans un combat' },
  { id: 'boss_dragon_enraged', name: 'Chasseur de Dragons', icon: '🐉', category: 'boss', hidden: true,
    check: () => false },

  // ═══ CONTRAT BADGES ═══
  { id: 'contract_first', name: 'Premier Contrat', icon: '🎯', category: 'contrat',
    check: () => { const c = ProfileManager.get('contractsCompleted', {}); return (c.bronze||0)+(c.silver||0)+(c.gold||0) >= 1; },
    progress: () => { const c = ProfileManager.get('contractsCompleted', {}); return { cur: Math.min((c.bronze||0)+(c.silver||0)+(c.gold||0), 1), max: 1 }; } },
  { id: 'contract_gold_hunter', name: 'Chasseur d\'Or', icon: '🥇', category: 'contrat',
    check: () => (ProfileManager.get('contractsCompleted', {}).gold || 0) >= 10,
    progress: () => ({ cur: Math.min(ProfileManager.get('contractsCompleted', {}).gold || 0, 10), max: 10 }) },
  { id: 'contract_perfectionist', name: 'Perfectionniste', icon: '✨', category: 'contrat',
    check: () => false, hint: '5 contrats Or d\'affilée' },
  { id: 'contract_all_bronze', name: 'Tout Bronze', icon: '🥉', category: 'contrat', hidden: true,
    check: () => (ProfileManager.get('contractsCompleted', {}).bronze || 0) >= 20 },
```

**Step 2: Add boss & contrat sections to `renderProfileDetail()`**

In the `sections` array, add:

```js
    { key: 'boss', title: '⚔️ Boss' },
    { key: 'contrat', title: '🎯 Contrats' },
```

Insert these before `{ key: 'hidden', title: '🔮 Secrets' }`.

**Step 3: Commit**

```bash
git add js/app.js
git commit -m "feat(v3): boss + contrat badge definitions in profile detail"
```

---

## Task 9: Update Service Worker Cache

**Files:**
- Modify: `sw.js`

**Step 1: Bump cache version**

Change `CACHE_NAME` to `v7` (or next version).

**Step 2: Commit**

```bash
git add sw.js
git commit -m "chore: bump service worker cache to v7"
```

---

## Task 10: Manual Testing & Polish

**Step 1: Run existing Playwright tests to verify no regressions**

Run: `cd /c/Users/User/Claude/MathQuiz && npx playwright test`

Expected: All 10 existing tests pass.

**Step 2: Manual testing checklist**

Open `index.html` in browser and verify:

- [ ] Normal game flow unchanged (play 2-3 games without boss)
- [ ] Contract screen appears after clicking "Jouer"
- [ ] "Jouer sans contrat" skips directly to game
- [ ] Selecting a contract shows indicator during game
- [ ] Contract result shown at end of game
- [ ] Contract bonus coins applied correctly
- [ ] After ~5+ games, boss appears (increase `gamesSinceBoss` in console to test faster)
- [ ] Boss appear screen shows correctly with emoji, name, stake
- [ ] "Plus tard" returns to home with boss icon pulsing
- [ ] Clicking boss icon re-opens appear screen
- [ ] Boss fight: phase 1 has timer, 3 questions
- [ ] Boss fight: phase 2 has multi-step question
- [ ] Victory: loot shown, coins/XP awarded
- [ ] Defeat: stake lost, encouraging message
- [ ] Boss themes appear in profile after victory (not in shop)
- [ ] New badge sections visible in profile detail

**Step 3: Fix any issues found, then final commit**

```bash
git add -A
git commit -m "fix(v3): polish and bug fixes from manual testing"
```

---

## Task 11: Deploy to GitHub Pages

**Step 1: Deploy**

Run:
```bash
cd /tmp/mathquiz-deploy && cp -r /c/Users/User/Claude/MathQuiz/* . && git add -A && git commit -m "V3: Boss Fights + Contrat d'Objectif" && git push
```

**Step 2: Verify live at https://pezzonidasit.github.io/mathquiz/**

---

## Summary of all commits

| Task | Commit message |
|------|---------------|
| 1 | `feat(v3): boss pool + multi-step boss questions (6 bosses, 14 encounters)` |
| 2 | `feat(v3): 2 boss-exclusive themes (Antre du Dragon, Abysses)` |
| 3 | `feat(v3): boss loot rewards + contrat d'objectif generator` |
| 4 | `feat(v3): HTML screens for boss appear/fight/end + contrat` |
| 5 | `feat(v3): CSS for boss fight UI + contrat d'objectif` |
| 6 | `feat(v3): boss fight system — trigger, combat, rewards, badges` |
| 7 | `feat(v3): contrat d'objectif — selection, tracking, evaluation, badges` |
| 8 | `feat(v3): boss + contrat badge definitions in profile detail` |
| 9 | `chore: bump service worker cache to v7` |
| 10 | `fix(v3): polish and bug fixes from manual testing` |
| 11 | Deploy to GitHub Pages |
