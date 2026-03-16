/* QuizHero — Question Engine */

// ── Categories ──────────────────────────────────────────────────────
const CATEGORIES = {
  calcul:    { label: 'Calcul',          color: '#4a9eff' },
  logique:   { label: 'Logique',         color: '#4ecdc4' },
  geometrie: { label: 'Géométrie',       color: '#ff8c42' },
  fractions: { label: 'Fractions',       color: '#a855f7' },
  mesures:   { label: 'Mesures',         color: '#ff6b6b' },
  ouvert:    { label: 'Problèmes ouverts', color: '#ffd93d' }
};

// ── Utilities ───────────────────────────────────────────────────────
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Generators ──────────────────────────────────────────────────────

function generateCalcul(subLevel) {
  if (subLevel === 1) {
    const scenarios = [
      // Original scenarios
      () => {
        const n = rand(3, 8);
        const per = rand(4, 12);
        const bonus = rand(5, 20);
        return {
          text: `À la bibliothèque, ${n} étagères contiennent chacune ${per} livres. On ajoute ${bonus} livres. Combien y a-t-il de livres en tout ?`,
          answer: n * per + bonus,
          hint: `Calcule d'abord ${n} × ${per}, puis ajoute ${bonus}.`,
          explanation: `${n} × ${per} = ${n * per}, puis ${n * per} + ${bonus} = ${n * per + bonus}.`
        };
      },
      () => {
        const n = rand(3, 9);
        const per = rand(2, 6);
        const eaten = rand(2, 5);
        const total = n * per;
        return {
          text: `Au marché, tu achètes ${n} sachets de ${per} pommes. Tu en manges ${eaten}. Combien t'en reste-t-il ?`,
          answer: total - eaten,
          hint: `Calcule d'abord le total, puis retire ${eaten}.`,
          explanation: `${n} × ${per} = ${total}, puis ${total} − ${eaten} = ${total - eaten}.`
        };
      },
      () => {
        const n = rand(4, 7);
        const per = rand(3, 8);
        const extra = rand(3, 10);
        return {
          text: `En classe, il y a ${n} rangées de ${per} tables. La maîtresse ajoute ${extra} tables. Combien de tables en tout ?`,
          answer: n * per + extra,
          hint: `Multiplie d'abord, puis additionne.`,
          explanation: `${n} × ${per} = ${n * per}, plus ${extra} = ${n * per + extra}.`
        };
      },
      // New scenarios
      () => {
        const items = rand(50, 80);
        const groups = rand(6, 8);
        const answer = Math.floor(items / groups);
        return {
          text: `${items} bonbons doivent être répartis équitablement entre ${groups} enfants. Combien chaque enfant reçoit-il de bonbons ?`,
          answer,
          hint: `Divise ${items} par ${groups}.`,
          explanation: `${items} ÷ ${groups} = ${answer} bonbons par enfant.`
        };
      },
      () => {
        const unitPrice = rand(2, 5);
        const quantity = rand(4, 10);
        const answer = unitPrice * quantity;
        return {
          text: `Un crayon coûte ${unitPrice} CHF. Combien coûtent ${quantity} crayons ?`,
          answer,
          unit: 'CHF',
          hint: `Multiplie ${unitPrice} par ${quantity}.`,
          explanation: `${unitPrice} × ${quantity} = ${answer} CHF.`
        };
      }
    ];
    const s = pick(scenarios)();
    return { category: 'calcul', text: s.text, unit: s.unit || '', answer: s.answer, hint: s.hint, explanation: s.explanation };

  } else if (subLevel === 2) {
    const scenarios = [
      // Original
      () => {
        const n1 = rand(3, 7);
        const per1 = rand(4, 9);
        const n2 = rand(2, 6);
        const per2 = rand(3, 8);
        const answer = n1 * per1 + n2 * per2;
        return {
          text: `Un magasin reçoit ${n1} cartons de ${per1} jouets et ${n2} cartons de ${per2} peluches. Combien d'articles en tout ?`,
          answer,
          hint: `Calcule chaque groupe séparément, puis additionne.`,
          explanation: `${n1} × ${per1} = ${n1 * per1} et ${n2} × ${per2} = ${n2 * per2}. Total = ${answer}.`
        };
      },
      // New: decimals/money
      () => {
        const price1 = 2.50;
        const price2 = 1.75;
        const answer = price1 + price2;
        return {
          text: `Tu achètes un sandwich à ${price1} CHF et un jus à ${price2} CHF. Quel est le coût total ?`,
          answer,
          unit: 'CHF',
          hint: `Additionne ${price1} et ${price2}.`,
          explanation: `${price1} + ${price2} = ${answer} CHF.`
        };
      },
      // New: simple percentages
      () => {
        const price = rand(20, 50);
        const discountPercent = 25;
        const discount = price / 4;
        const answer = price - discount;
        return {
          text: `Un article coûte ${price} CHF. La boutique offre une réduction de ${discountPercent}%. Quel est le prix après réduction ?`,
          answer,
          unit: 'CHF',
          hint: `${discountPercent}% de ${price} = ${price} ÷ 4 = ${discount}. Prix réduit = ${price} − ${discount}.`,
          explanation: `${discountPercent}% de ${price} = ${discount} CHF. Prix réduit = ${answer} CHF.`
        };
      }
    ];
    const s = pick(scenarios)();
    return { category: 'calcul', text: s.text, unit: s.unit || '', answer: s.answer, hint: s.hint, explanation: s.explanation };

  } else {
    const scenarios = [
      // Original: three-step
      () => {
        const initial = rand(30, 80);
        const give = rand(5, 15);
        const receive = rand(3, 12);
        const lose = rand(2, 8);
        const answer = initial - give + receive - lose;
        return {
          text: `Tu as ${initial} billes. Tu en donnes ${give}, tu en reçois ${receive}, puis tu en perds ${lose}. Combien t'en reste-t-il ?`,
          answer,
          hint: `Fais les opérations une par une, dans l'ordre.`,
          explanation: `${initial} − ${give} = ${initial - give}, + ${receive} = ${initial - give + receive}, − ${lose} = ${answer}.`
        };
      },
      // New: 4+ step cascade
      () => {
        const start = rand(30, 60);
        const step1 = rand(5, 15);
        const step2 = rand(3, 10);
        const step3 = rand(2, 8);
        const step4 = rand(1, 5);
        const answer = start + step1 - step2 + step3 - step4;
        return {
          text: `Théo a ${start} CHF. Il gagne ${step1} CHF. Il dépense ${step2} CHF. Il reçoit ${step3} CHF. Il en perd ${step4} CHF. Combien a-t-il ?`,
          answer,
          unit: 'CHF',
          hint: `Fais : +${step1}, −${step2}, +${step3}, −${step4}.`,
          explanation: `${start} + ${step1} = ${start + step1}. −${step2} = ${start + step1 - step2}. +${step3} = ${start + step1 - step2 + step3}. −${step4} = ${answer} CHF.`
        };
      }
    ];
    const s = pick(scenarios)();
    return { category: 'calcul', text: s.text, unit: s.unit || '', answer: s.answer, hint: s.hint, explanation: s.explanation };
  }
}

function generateLogique(subLevel) {
  // 40% chance: new deduction/logic types (non-sequence)
  if (Math.random() < 0.4) {
    const deductionTypes = [
      () => {
        const n = rand(10, 29);
        const sum = (n % 10) + Math.floor(n / 10);
        return {
          text: `Qui suis-je ?\n• Je suis un nombre à 2 chiffres.\n• La somme de mes chiffres est ${sum}.\n• Mon double vaut ${n * 2}.`,
          answer: n,
          hint: `Cherche un nombre à 2 chiffres dont les chiffres font ${sum}. Puis vérifie le double.`,
          explanation: `Si le nombre est ${n}, alors ${Math.floor(n / 10)} + ${n % 10} = ${sum} et ${n} × 2 = ${n * 2}. Je suis ${n}.`
        };
      },
      () => {
        const n = rand(10, 34);
        const isEven = n % 2 === 0;
        const tens = Math.floor(n / 10);
        const units = n % 10;
        const sum = tens + units;
        return {
          text: `Qui suis-je ?\n• Je suis un nombre ${isEven ? 'pair' : 'impair'} à 2 chiffres.\n• Mon chiffre des dizaines est ${tens}.\n• La somme de mes chiffres est ${sum}.`,
          answer: n,
          hint: `Dizaines = ${tens}. Si la somme est ${sum}, unités = ${sum - tens}.`,
          explanation: `Dizaines = ${tens}. Unités = ${units}. Nombre = ${n} (${isEven ? 'pair' : 'impair'} ✓).`
        };
      }
    ];
    const s = pick(deductionTypes)();
    return { category: 'logique', text: s.text, unit: '', answer: s.answer, hint: s.hint, explanation: s.explanation };
  }

  // 30% chance: original "qui suis-je"
  if (Math.random() < 0.3) {
    const n = rand(5, 25) * 2;
    const double = n * 2;
    return {
      category: 'logique',
      text: `Qui suis-je ? Mon double est ${double} et ma moitié est ${n / 2}.`,
      unit: '',
      answer: n,
      hint: `Si mon double est ${double}, divise par 2.`,
      explanation: `${double} ÷ 2 = ${n}. Vérification : ${n} ÷ 2 = ${n / 2}. ✓`
    };
  }

  // Rest: sequences
  const seqTypes = subLevel === 1 ? [0, 1, 2] : subLevel === 2 ? [3, 4, 5] : [6, 7, 8];
  const type = seqTypes[Math.floor(Math.random() * seqTypes.length)];

  switch (type) {
    case 0: {
      const start = rand(1, 20);
      const step = rand(2, 12);
      const seq = [];
      for (let i = 0; i < 5; i++) seq.push(start + step * i);
      const answer = start + step * 5;
      return { category: 'logique', text: `Trouve le nombre suivant : ${seq.join(', ')}, ?`, unit: '', answer,
        hint: `Regarde la différence entre chaque nombre.`,
        explanation: `On ajoute ${step} à chaque fois. ${seq[4]} + ${step} = ${answer}.` };
    }
    case 1: {
      const start = rand(60, 100);
      const step = rand(3, 11);
      const seq = [];
      for (let i = 0; i < 5; i++) seq.push(start - step * i);
      const answer = start - step * 5;
      return { category: 'logique', text: `Trouve le nombre suivant : ${seq.join(', ')}, ?`, unit: '', answer,
        hint: `La suite descend. De combien à chaque fois ?`,
        explanation: `On enlève ${step} à chaque fois. ${seq[4]} − ${step} = ${answer}.` };
    }
    case 2: {
      const offset = rand(0, 3);
      const seq = [];
      for (let i = 1; i <= 5; i++) seq.push((i + offset) * (i + offset));
      const answer = (6 + offset) * (6 + offset);
      return { category: 'logique', text: `Trouve le nombre suivant : ${seq.join(', ')}, ?`, unit: '', answer,
        hint: `Ce sont des carrés parfaits !`,
        explanation: `${seq[0]}=${1+offset}², ${seq[1]}=${2+offset}², ... Le suivant est ${6+offset}² = ${answer}.` };
    }
    case 3: {
      const start = rand(2, 5);
      const factor = rand(2, 4);
      const seq = [];
      let val = start;
      for (let i = 0; i < 4; i++) { seq.push(val); val *= factor; }
      const answer = val;
      return { category: 'logique', text: `Trouve le nombre suivant : ${seq.join(', ')}, ?`, unit: '', answer,
        hint: `Chaque nombre est multiplié par le même facteur.`,
        explanation: `On multiplie par ${factor} à chaque fois. ${seq[3]} × ${factor} = ${answer}.` };
    }
    case 4: {
      const a = rand(1, 5), b = rand(1, 5);
      const seq = [a, b];
      for (let i = 2; i < 6; i++) seq.push(seq[i-1] + seq[i-2]);
      const answer = seq[5] + seq[4];
      seq.push(answer);
      const shown = seq.slice(0, 6);
      return { category: 'logique', text: `Trouve le nombre suivant : ${shown.join(', ')}, ?`, unit: '', answer,
        hint: `Chaque nombre est la somme des deux précédents.`,
        explanation: `${seq[4]} + ${seq[5]} = ${answer}. Chaque terme = somme des 2 précédents.` };
    }
    case 5: {
      const k = rand(1, 4);
      let val = rand(1, 4);
      const seq = [val];
      for (let i = 0; i < 4; i++) { val = val * 2 + k; seq.push(val); }
      const answer = val * 2 + k;
      return { category: 'logique', text: `Trouve le nombre suivant : ${seq.join(', ')}, ?`, unit: '', answer,
        hint: `Essaie : doubler puis ajouter un petit nombre.`,
        explanation: `Chaque terme = précédent × 2 + ${k}. ${seq[4]} × 2 + ${k} = ${answer}.` };
    }
    case 6: {
      const a = rand(2, 6);
      const b = rand(2, 3);
      let val = rand(2, 6);
      const seq = [val];
      for (let i = 0; i < 4; i++) {
        val = (i % 2 === 0) ? val + a : val * b;
        seq.push(val);
      }
      const answer = (4 % 2 === 0) ? val + a : val * b;
      return { category: 'logique', text: `Trouve le nombre suivant : ${seq.join(', ')}, ?`, unit: '', answer,
        hint: `Regarde : une fois on ajoute, une fois on multiplie…`,
        explanation: `Le motif alterne : +${a}, ×${b}. Le suivant est ${answer}.` };
    }
    case 7: {
      const a = rand(1, 10), b = rand(20, 40);
      const stepA = rand(2, 5), stepB = rand(3, 7);
      const seq = [];
      for (let i = 0; i < 3; i++) { seq.push(a + stepA * i); seq.push(b + stepB * i); }
      const answer = a + stepA * 3;
      return { category: 'logique', text: `Trouve le nombre suivant : ${seq.join(', ')}, ?`, unit: '', answer,
        hint: `Et si c'étaient deux suites entrelacées ? Regarde un nombre sur deux.`,
        explanation: `Deux suites : ${a}, ${a+stepA}, ${a+stepA*2} (+${stepA}) et ${b}, ${b+stepB}, ${b+stepB*2} (+${stepB}). Le suivant est ${answer}.` };
    }
    case 8: {
      const start = rand(1, 8);
      const seq = [start];
      let val = start;
      for (let i = 1; i <= 5; i++) { val += i; seq.push(val); }
      const answer = val + 6;
      return { category: 'logique', text: `Trouve le nombre suivant : ${seq.join(', ')}, ?`, unit: '', answer,
        hint: `La différence entre chaque nombre augmente de 1 à chaque fois.`,
        explanation: `On ajoute +1, +2, +3, +4, +5, +6. ${seq[5]} + 6 = ${answer}.` };
    }
  }
}

function generateGeometrie(subLevel) {
  if (subLevel === 1) {
    const scenarios = [
      // Rectangle perimeter
      () => {
        const l = rand(3, 15);
        const w = rand(2, 10);
        const answer = 2 * (l + w);
        return {
          text: `Un rectangle mesure ${l} cm de long et ${w} cm de large. Quel est son périmètre ?`,
          unit: 'cm',
          answer,
          hint: `Périmètre = 2 × (longueur + largeur).`,
          explanation: `2 × (${l} + ${w}) = 2 × ${l + w} = ${answer} cm.`
        };
      },
      // Triangle perimeter
      () => {
        const s1 = rand(5, 12);
        const s2 = rand(5, 12);
        const s3 = rand(5, 12);
        const answer = s1 + s2 + s3;
        return {
          text: `Un triangle a des côtés de ${s1} cm, ${s2} cm et ${s3} cm. Quel est son périmètre ?`,
          unit: 'cm',
          answer,
          hint: `Additionne les trois côtés.`,
          explanation: `${s1} + ${s2} + ${s3} = ${answer} cm.`
        };
      },
      // Complementary angles
      () => {
        const angle1 = rand(20, 70);
        const answer = 90 - angle1;
        return {
          text: `Dans un angle droit (90°), un des deux angles complémentaires mesure ${angle1}°. Combien mesure l'autre ?`,
          unit: '°',
          answer,
          hint: `Les deux angles doivent faire 90° ensemble.`,
          explanation: `90° − ${angle1}° = ${answer}°.`
        };
      }
    ];
    const s = pick(scenarios)();
    return { category: 'geometrie', text: s.text, unit: s.unit, answer: s.answer, hint: s.hint, explanation: s.explanation };

  } else if (subLevel === 2) {
    const scenarios = [
      // Rectangle area
      () => {
        const l = rand(3, 12);
        const w = rand(2, 9);
        const answer = l * w;
        return {
          text: `Un rectangle mesure ${l} cm de long et ${w} cm de large. Quelle est son aire ?`,
          unit: 'cm²',
          answer,
          hint: `Aire = longueur × largeur.`,
          explanation: `${l} × ${w} = ${answer} cm².`
        };
      },
      // Triangle area
      () => {
        const base = rand(4, 12) * 2;
        const height = rand(3, 10);
        const answer = (base * height) / 2;
        return {
          text: `Un triangle a une base de ${base} cm et une hauteur de ${height} cm. Quelle est son aire ?`,
          unit: 'cm²',
          answer,
          hint: `Aire = base × hauteur ÷ 2.`,
          explanation: `${base} × ${height} = ${base * height}, puis ${base * height} ÷ 2 = ${answer} cm².`
        };
      },
      // Circle perimeter (π ≈ 3)
      () => {
        const d = rand(2, 10);
        const answer = d * 3;
        return {
          text: `Un cercle a un diamètre de ${d} m. Quel est son périmètre ? (Utilise π ≈ 3)`,
          unit: 'm',
          answer,
          hint: `Circonférence ≈ diamètre × 3.`,
          explanation: `${d} × 3 = ${answer} m.`
        };
      }
    ];
    const s = pick(scenarios)();
    return { category: 'geometrie', text: s.text, unit: s.unit, answer: s.answer, hint: s.hint, explanation: s.explanation };

  } else {
    const scenarios = [
      // Composite: rectangle + square
      () => {
        const rl = rand(5, 10);
        const rw = rand(3, 6);
        const side = rand(2, 4);
        const answer = rl * rw + side * side;
        return {
          text: `Une forme est composée d'un rectangle de ${rl} cm × ${rw} cm et d'un carré de côté ${side} cm. Quelle est l'aire totale ?`,
          unit: 'cm²',
          answer,
          hint: `Calcule l'aire de chaque forme, puis additionne.`,
          explanation: `Rectangle : ${rl} × ${rw} = ${rl * rw}. Carré : ${side} × ${side} = ${side * side}. Total = ${answer} cm².`
        };
      },
      // Box volume
      () => {
        const l = rand(3, 8);
        const w = rand(2, 6);
        const h = rand(2, 5);
        const answer = l * w * h;
        return {
          text: `Une boîte mesure ${l} cm de long, ${w} cm de large et ${h} cm de haut. Quel est son volume ?`,
          unit: 'cm³',
          answer,
          hint: `Volume = longueur × largeur × hauteur.`,
          explanation: `${l} × ${w} × ${h} = ${answer} cm³.`
        };
      },
      // Supplementary angles
      () => {
        const angle1 = rand(60, 120);
        const answer = 180 - angle1;
        return {
          text: `Deux angles supplémentaires sont côte à côte sur une droite. L'un mesure ${angle1}°. Combien mesure l'autre ?`,
          unit: '°',
          answer,
          hint: `Deux angles supplémentaires font 180° en tout.`,
          explanation: `180° − ${angle1}° = ${answer}°.`
        };
      }
    ];
    const s = pick(scenarios)();
    return { category: 'geometrie', text: s.text, unit: s.unit, answer: s.answer, hint: s.hint, explanation: s.explanation };
  }
}

function generateFractions(subLevel) {
  if (subLevel === 1) {
    const scenarios = [
      // Pizza parts remaining
      () => {
        const total = pick([4, 6, 8]);
        const eaten = rand(1, total - 1);
        const answer = total - eaten;
        return {
          text: `Une pizza est coupée en ${total} parts. Tu en manges ${eaten}. Combien de parts reste-t-il ?`,
          unit: 'parts',
          answer,
          hint: `C'est une simple soustraction.`,
          explanation: `${total} − ${eaten} = ${answer} parts restantes.`
        };
      },
      // Equivalent fractions
      () => {
        const num = rand(2, 4);
        const denom = rand(3, 5);
        const multiplier = rand(2, 3);
        const newDenom = denom * multiplier;
        const newNum = num * multiplier;
        return {
          text: `Complète : ${num}/${denom} = ?/${newDenom}. Quel est le numérateur manquant ?`,
          unit: '',
          answer: newNum,
          hint: `${denom} a été multiplié par ${multiplier} pour faire ${newDenom}. Fais pareil avec ${num}.`,
          explanation: `${denom} × ${multiplier} = ${newDenom}, donc ${num} × ${multiplier} = ${newNum}. La fraction équivalente est ${newNum}/${newDenom}.`
        };
      },
      // Fraction of quantity
      () => {
        const denom = rand(3, 5);
        const total = denom * rand(4, 8);
        const answer = total / denom;
        return {
          text: `Dans un sac de ${total} billes, 1/${denom} sont rouges. Combien y a-t-il de billes rouges ?`,
          unit: '',
          answer,
          hint: `Divise ${total} par ${denom}.`,
          explanation: `1/${denom} de ${total} = ${total} ÷ ${denom} = ${answer} billes rouges.`
        };
      }
    ];
    const s = pick(scenarios)();
    return { category: 'fractions', text: s.text, unit: s.unit || '', answer: s.answer, hint: s.hint, explanation: s.explanation };

  } else if (subLevel === 2) {
    const scenarios = [
      // Fraction of a number: 1/n of X
      () => {
        const n = pick([2, 3, 4, 5]);
        const x = n * rand(3, 10);
        const answer = x / n;
        return {
          text: `Combien vaut 1/${n} de ${x} ?`,
          unit: '',
          answer,
          hint: `Divise ${x} par ${n}.`,
          explanation: `${x} ÷ ${n} = ${answer}.`
        };
      },
      // Compare fractions same denominator
      () => {
        const d = rand(4, 8);
        const n1 = rand(1, d - 1);
        const n2 = rand(1, d - 1);
        const answer = Math.max(n1, n2);
        return {
          text: `Quelle fraction est la plus grande : ${n1}/${d} ou ${n2}/${d} ? Donne le numérateur de la plus grande.`,
          unit: '',
          answer,
          hint: `Les dénominateurs sont identiques, compare les numérateurs.`,
          explanation: `${answer}/${d} > ${Math.min(n1, n2)}/${d}. Numérateur = ${answer}.`
        };
      },
      // Subtract same denominator
      () => {
        const d = rand(4, 8);
        const a = rand(3, d - 1);
        const b = rand(1, a - 1);
        const answer = a - b;
        return {
          text: `Combien font ${a}/${d} − ${b}/${d} ? Donne le numérateur (dénominateur = ${d}).`,
          unit: '',
          answer,
          hint: `Même dénominateur : soustrais les numérateurs.`,
          explanation: `${a}/${d} − ${b}/${d} = ${answer}/${d}. Le numérateur est ${answer}.`
        };
      }
    ];
    const s = pick(scenarios)();
    return { category: 'fractions', text: s.text, unit: s.unit || '', answer: s.answer, hint: s.hint, explanation: s.explanation };

  } else {
    const scenarios = [
      // Adding fractions same denominator
      () => {
        const d = pick([4, 5, 6, 8]);
        const a = rand(1, d - 2);
        const b = rand(1, d - a);
        const answer = a + b;
        return {
          text: `Combien font ${a}/${d} + ${b}/${d} ? Donne le numérateur (le dénominateur reste ${d}).`,
          unit: '',
          answer,
          hint: `Quand les dénominateurs sont les mêmes, on additionne les numérateurs.`,
          explanation: `${a}/${d} + ${b}/${d} = ${a + b}/${d}. Le numérateur est ${answer}.`
        };
      },
      // Fraction to decimal
      () => {
        const scenarios2 = [
          { num: 1, denom: 2, dec: 0.5 },
          { num: 1, denom: 4, dec: 0.25 },
          { num: 3, denom: 4, dec: 0.75 },
          { num: 1, denom: 5, dec: 0.2 }
        ];
        const s = pick(scenarios2);
        return {
          text: `Quelle est la valeur décimale de ${s.num}/${s.denom} ?`,
          unit: '',
          answer: s.dec,
          hint: `Divise ${s.num} par ${s.denom}.`,
          explanation: `${s.num}/${s.denom} = ${s.dec}.`
        };
      }
    ];
    const s = pick(scenarios)();
    return { category: 'fractions', text: s.text, unit: s.unit || '', answer: s.answer, hint: s.hint, explanation: s.explanation };
  }
}

function generateMesures(subLevel) {
  if (subLevel === 1) {
    const scenarios = [
      // cm ↔ m conversions
      () => {
        if (Math.random() < 0.5) {
          const m = rand(1, 9);
          const cm = rand(10, 90);
          const answer = m * 100 + cm;
          return {
            text: `Convertis ${m} m et ${cm} cm en centimètres.`,
            unit: 'cm',
            answer,
            hint: `1 mètre = 100 centimètres.`,
            explanation: `${m} × 100 + ${cm} = ${answer} cm.`
          };
        } else {
          const totalCm = rand(120, 500);
          const answer = totalCm;
          const m = Math.floor(totalCm / 100);
          const cm = totalCm % 100;
          return {
            text: `${m} m ${cm} cm = combien de cm au total ?`,
            unit: 'cm',
            answer,
            hint: `Convertis les mètres en cm, puis ajoute le reste.`,
            explanation: `${m} × 100 + ${cm} = ${answer} cm.`
          };
        }
      },
      // Duration between times
      () => {
        const h1 = rand(8, 14);
        const m1 = rand(0, 5) * 10;
        const h2 = h1 + rand(1, 3);
        const m2 = m1 + rand(10, 50);
        let hResult = h2 - h1;
        let mResult = m2 - m1;
        if (mResult >= 60) { hResult++; mResult -= 60; }
        const answer = hResult * 60 + mResult;
        return {
          text: `L'école commence à ${h1}h${m1} et finit à ${h2}h${m2}. Combien de minutes dure la journée ?`,
          unit: 'min',
          answer,
          hint: `Compte les heures et les minutes séparément.`,
          explanation: `De ${h1}h${m1} à ${h2}h${m2} = ${hResult}h ${mResult}min = ${answer} minutes.`
        };
      }
    ];
    const s = pick(scenarios)();
    return { category: 'mesures', text: s.text, unit: s.unit, answer: s.answer, hint: s.hint, explanation: s.explanation };

  } else if (subLevel === 2) {
    const scenarios = [
      // Hours + minutes to total minutes
      () => {
        const h = rand(1, 4);
        const m = rand(5, 55);
        const answer = h * 60 + m;
        return {
          text: `Convertis ${h} h ${m} min en minutes.`,
          unit: 'min',
          answer,
          hint: `1 heure = 60 minutes.`,
          explanation: `${h} × 60 + ${m} = ${answer} minutes.`
        };
      },
      // Liters to mL
      () => {
        const liters = rand(2, 5) + (rand(0, 1) ? 0.5 : 0);
        const ml = liters * 1000;
        return {
          text: `Convertis ${liters} L en millilitres.`,
          unit: 'mL',
          answer: ml,
          hint: `1 litre = 1000 mL.`,
          explanation: `${liters} × 1000 = ${ml} mL.`
        };
      },
      // Arrival time
      () => {
        const h = rand(8, 18);
        const m = rand(0, 5) * 10;
        const travel = rand(30, 90);
        let newH = h;
        let newM = m + travel;
        if (newM >= 60) { newH += Math.floor(newM / 60); newM = newM % 60; }
        return {
          text: `Le bus part à ${h}h${m}. Le trajet dure ${travel} minutes. À quelle heure arrive-t-il ? Donne les minutes.`,
          unit: '',
          answer: newM,
          hint: `Ajoute ${travel} minutes à ${h}h${m}.`,
          explanation: `${h}h${m} + ${travel} min = ${newH}h${newM}. Les minutes = ${newM}.`
        };
      }
    ];
    const s = pick(scenarios)();
    return { category: 'mesures', text: s.text, unit: s.unit, answer: s.answer, hint: s.hint, explanation: s.explanation };

  } else {
    const scenarios = [
      // kg + g to total grams
      () => {
        const kg = rand(1, 5);
        const g = rand(50, 900);
        const answer = kg * 1000 + g;
        return {
          text: `Convertis ${kg} kg ${g} g en grammes.`,
          unit: 'g',
          answer,
          hint: `1 kg = 1000 g.`,
          explanation: `${kg} × 1000 + ${g} = ${answer} g.`
        };
      },
      // Perimeter/real distance
      () => {
        const l = rand(10, 20);
        const w = rand(5, 15);
        const answer = 2 * (l + w);
        return {
          text: `Un terrain rectangulaire mesure ${l} m de long et ${w} m de large. Combien de mètres faut-il pour l'entourer complètement ?`,
          unit: 'm',
          answer,
          hint: `Calcule le périmètre.`,
          explanation: `2 × (${l} + ${w}) = ${answer} m.`
        };
      },
      // Mass comparison
      () => {
        const w1 = rand(1, 5);
        const w2 = rand(1, 5);
        const g1 = w1 * 1000 + rand(100, 900);
        const g2 = w2 * 1000 + rand(100, 900);
        const answer = Math.abs(g1 - g2);
        return {
          text: `Un sac A pèse ${w1} kg ${g1 % 1000} g et un sac B pèse ${w2} kg ${g2 % 1000} g. Combien de grammes de différence ?`,
          unit: 'g',
          answer,
          hint: `Convertis les deux en grammes et soustrais.`,
          explanation: `Sac A : ${g1} g. Sac B : ${g2} g. Différence : ${answer} g.`
        };
      }
    ];
    const s = pick(scenarios)();
    return { category: 'mesures', text: s.text, unit: s.unit, answer: s.answer, hint: s.hint, explanation: s.explanation };
  }
}

function generateOuvert(subLevel) {
  if (subLevel === 1) {
    const scenarios = [
      // Coin combinations
      () => {
        const target = pick([11, 13, 17, 19, 21]);
        let count = 0;
        for (let fives = 0; fives * 5 <= target; fives++) {
          const rest = target - fives * 5;
          if (rest % 2 === 0) count++;
        }
        return {
          text: `Combien de façons peux-tu faire ${target} CHF avec des pièces de 5 CHF et de 2 CHF ?`,
          unit: '',
          answer: count,
          hint: `Essaie avec 0 pièces de 5, puis 1 pièce de 5, etc.`,
          explanation: `Il y a ${count} façon(s) de combiner des pièces de 5 CHF et 2 CHF pour faire ${target} CHF.`
        };
      },
      // Outfit combinations
      () => {
        const tops = rand(3, 6);
        const bottoms = rand(2, 5);
        const answer = tops * bottoms;
        return {
          text: `Tu as ${tops} t-shirts et ${bottoms} pantalons. Combien de tenues différentes peux-tu faire ?`,
          unit: '',
          answer,
          hint: `Pour chaque t-shirt, tu peux porter n'importe quel pantalon.`,
          explanation: `${tops} × ${bottoms} = ${answer} tenues possibles.`
        };
      },
      // Age simple
      () => {
        const current = rand(8, 15);
        const years = rand(2, 5);
        const answer = current + years;
        return {
          text: `Tu as actuellement ${current} ans. Quel âge auras-tu dans ${years} ans ?`,
          unit: 'ans',
          answer,
          hint: `Ajoute ${years} à ${current}.`,
          explanation: `${current} + ${years} = ${answer} ans.`
        };
      }
    ];
    const s = pick(scenarios)();
    return { category: 'ouvert', text: s.text, unit: s.unit || '', answer: s.answer, hint: s.hint, explanation: s.explanation };

  } else if (subLevel === 2) {
    const scenarios = [
      // Handshake problem
      () => {
        const n = rand(4, 8);
        const answer = n * (n - 1) / 2;
        return {
          text: `${n} amis se retrouvent et chacun fait une poignée de main à chacun des autres. Combien de poignées de main en tout ?`,
          unit: '',
          answer,
          hint: `La première personne serre la main de ${n - 1} personnes, la deuxième de ${n - 2}…`,
          explanation: `${n} × ${n - 1} ÷ 2 = ${answer} poignées de main.`
        };
      },
      // Speed/distance/time
      () => {
        const dist = rand(20, 40);
        const time = rand(2, 5);
        const answer = dist / time;
        return {
          text: `Un coureur parcourt ${dist} km en ${time} heures. Quelle est sa vitesse moyenne ?`,
          unit: 'km/h',
          answer,
          hint: `Vitesse = distance ÷ temps.`,
          explanation: `${dist} ÷ ${time} = ${answer} km/h.`
        };
      },
      // Unequal sharing
      () => {
        const total = rand(30, 60);
        const ratio = rand(2, 3);
        const part1 = total / (ratio + 1);
        const answer = part1;
        return {
          text: `On partage ${total} billes entre Alex et Zoé. Alex reçoit le ${ratio} fois plus que Zoé. Combien Zoé reçoit-elle ?`,
          unit: '',
          answer,
          hint: `Zoé = X, Alex = ${ratio}X. Total = ${total}.`,
          explanation: `${ratio + 1}X = ${total} → X = ${answer}.`
        };
      }
    ];
    const s = pick(scenarios)();
    return { category: 'ouvert', text: s.text, unit: s.unit || '', answer: s.answer, hint: s.hint, explanation: s.explanation };

  } else {
    const scenarios = [
      // Tank/filling
      () => {
        const capacity = rand(100, 200);
        const flow = rand(5, 15);
        const time = capacity / flow;
        return {
          text: `Un réservoir de ${capacity} litres se remplit à ${flow} L/min. Combien de minutes pour le remplir ?`,
          unit: 'min',
          answer: time,
          hint: `Temps = capacité ÷ débit.`,
          explanation: `${capacity} ÷ ${flow} = ${time} minutes.`
        };
      },
      // Combinations/counting
      () => {
        const n = rand(3, 5);
        const answer = n * (n - 1);
        return {
          text: `Un code secret a 2 chiffres différents parmi 1, 2, 3, ${n === 4 ? '4' : '4, 5'}. (L'ordre compte.) Combien de codes ?`,
          unit: '',
          answer,
          hint: `${n} choix pour le 1er chiffre, ${n - 1} pour le 2e.`,
          explanation: `${n} × ${n - 1} = ${answer} codes.`
        };
      }
    ];
    const s = pick(scenarios)();
    return { category: 'ouvert', text: s.text, unit: s.unit || '', answer: s.answer, hint: s.hint, explanation: s.explanation };
  }
}
