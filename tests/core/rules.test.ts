// tests/core/rules.test.ts — cœur de la logique : génération + application
// des coups. Cas concrets : entrée depuis la barre, hit, bear-off exact,
// bear-off overshoot, intégration de doublons.

import { describe, expect, it } from 'vitest';
import {
  allHome,
  applyMove,
  calcPipCount,
  canLand,
  farthestHome,
  getCandidateMoves,
  getValidMoves,
  maxSequenceLength,
  pipDist,
} from '../../src/core/rules.js';
import { newGameState } from '../../src/core/state.js';
import type { GameState, Point } from '../../src/types/game.js';

/** Construit un GameState minimal pour les tests, en surchargeant ce qu'on veut. */
function makeState(overrides: Partial<GameState> = {}): GameState {
  const pts: Point[] = Array.from({ length: 24 }, () => ({ n: 0, p: 0 }));
  return {
    pts,
    bar: { 1: 0, 2: 0 },
    off: { 1: 0, 2: 0 },
    dice: [],
    moves: [],
    openingRolls: { 1: 0, 2: 0 },
    turn: 1,
    phase: 'move',
    winner: 0,
    ...overrides,
  };
}

describe('canLand', () => {
  it('case vide → ok', () => {
    const pts: Point[] = [{ n: 0, p: 0 }];
    expect(canLand(pts, 0, 1)).toBe(true);
  });

  it("case du même joueur → ok quel que soit n", () => {
    const pts: Point[] = [{ n: 5, p: 1 }];
    expect(canLand(pts, 0, 1)).toBe(true);
  });

  it('blot adverse (n=1) → ok (on hit)', () => {
    const pts: Point[] = [{ n: 1, p: 2 }];
    expect(canLand(pts, 0, 1)).toBe(true);
  });

  it('point adverse bloqué (n≥2) → ko', () => {
    const pts: Point[] = [{ n: 2, p: 2 }];
    expect(canLand(pts, 0, 1)).toBe(false);
  });
});

describe('pipDist', () => {
  it('P1 : dist = i+1', () => {
    expect(pipDist(0, 1)).toBe(1);
    expect(pipDist(5, 1)).toBe(6);
    expect(pipDist(23, 1)).toBe(24);
  });

  it('P2 : dist = 24 − i', () => {
    expect(pipDist(0, 2)).toBe(24);
    expect(pipDist(18, 2)).toBe(6);
    expect(pipDist(23, 2)).toBe(1);
  });
});

describe('calcPipCount', () => {
  it('plateau de départ : 167 pour chaque joueur', () => {
    const s = newGameState();
    expect(calcPipCount(s, 1)).toBe(167);
    expect(calcPipCount(s, 2)).toBe(167);
  });

  it('un pion sur la barre compte pour 25', () => {
    const s = makeState({ bar: { 1: 1, 2: 0 } });
    expect(calcPipCount(s, 1)).toBe(25);
  });
});

describe('allHome', () => {
  it('plateau de départ : faux pour les deux joueurs', () => {
    const s = newGameState();
    expect(allHome(s, 1)).toBe(false);
    expect(allHome(s, 2)).toBe(false);
  });

  it('P1 tous regroupés en 0..5 et rien sur la barre → vrai', () => {
    const s = makeState();
    s.pts[2] = { n: 10, p: 1 };
    s.pts[4] = { n: 5, p: 1 };
    expect(allHome(s, 1)).toBe(true);
  });

  it('un pion sur la barre annule allHome', () => {
    const s = makeState({ bar: { 1: 1, 2: 0 } });
    s.pts[2] = { n: 14, p: 1 };
    expect(allHome(s, 1)).toBe(false);
  });
});

describe('farthestHome', () => {
  it('P1 : index le plus grand dans 0..5 contenant ses pions', () => {
    const s = makeState();
    s.pts[1] = { n: 2, p: 1 };
    s.pts[4] = { n: 3, p: 1 };
    expect(farthestHome(s, 1)).toBe(4);
  });

  it('P2 : index le plus petit dans 18..23 contenant ses pions', () => {
    const s = makeState();
    s.pts[20] = { n: 1, p: 2 };
    s.pts[23] = { n: 2, p: 2 };
    expect(farthestHome(s, 2)).toBe(20);
  });

  it('aucun pion en jan intérieur → -1', () => {
    expect(farthestHome(makeState(), 1)).toBe(-1);
  });
});

describe('getValidMoves — entrées depuis la barre', () => {
  it('priorise les entrées et ignore les autres pions', () => {
    const s = makeState({ bar: { 1: 1, 2: 0 }, moves: [3, 5] });
    s.pts[20] = { n: 1, p: 1 }; // ne doit pas générer de mouvement (barre prioritaire)
    const mv = getValidMoves(s, 1);
    // P1 entre par 24-d : d=3 → 21, d=5 → 19
    expect(mv).toEqual(
      expect.arrayContaining([
        { f: 'bar', t: 21, d: 3 },
        { f: 'bar', t: 19, d: 5 },
      ]),
    );
    expect(mv).toHaveLength(2);
  });

  it('ne propose pas une entrée sur point adverse bloqué', () => {
    const s = makeState({ bar: { 1: 1, 2: 0 }, moves: [3] });
    s.pts[21] = { n: 2, p: 2 };
    expect(getValidMoves(s, 1)).toEqual([]);
  });

  it('P2 entre par d-1', () => {
    const s = makeState({ bar: { 1: 0, 2: 1 }, moves: [1, 6], turn: 2 });
    const mv = getValidMoves(s, 2);
    expect(mv).toEqual(
      expect.arrayContaining([
        { f: 'bar', t: 0, d: 1 },
        { f: 'bar', t: 5, d: 6 },
      ]),
    );
  });
});

describe('getValidMoves — mouvements ordinaires', () => {
  it('dédoublonne les valeurs de dés (un double ne génère pas 4× le même coup)', () => {
    const s = makeState({ moves: [3, 3, 3, 3] });
    s.pts[10] = { n: 1, p: 1 };
    const mv = getValidMoves(s, 1);
    expect(mv).toHaveLength(1); // un seul coup f=10, t=7, d=3
    expect(mv[0]).toEqual({ f: 10, t: 7, d: 3 });
  });

  it('refuse les destinations bloquées par 2+ pions adverses', () => {
    const s = makeState({ moves: [2] });
    s.pts[10] = { n: 1, p: 1 };
    s.pts[8] = { n: 2, p: 2 };
    expect(getValidMoves(s, 1)).toEqual([]);
  });
});

describe('getValidMoves — bear-off', () => {
  it("exact : pion en 5 avec dé 6 ne sort pas si plus éloigné existe", () => {
    const s = makeState({ moves: [6] });
    s.pts[4] = { n: 1, p: 1 };
    s.pts[5] = { n: 1, p: 1 };
    // farthest = 5, donc pion en 4 (dd=5, d=6) ne peut PAS sortir
    const mv = getValidMoves(s, 1);
    expect(mv).toContainEqual({ f: 5, t: 'off', d: 6 });
    expect(mv).not.toContainEqual({ f: 4, t: 'off', d: 6 });
  });

  it("overshoot : pion en 3 avec dé 6, c'est le plus éloigné → sort", () => {
    const s = makeState({ moves: [6] });
    s.pts[3] = { n: 1, p: 1 };
    s.pts[1] = { n: 1, p: 1 };
    expect(getValidMoves(s, 1)).toContainEqual({ f: 3, t: 'off', d: 6 });
  });

  it("interdit le bear-off tant qu'on n'est pas tous home", () => {
    const s = makeState({ moves: [6] });
    s.pts[3] = { n: 1, p: 1 };
    s.pts[20] = { n: 1, p: 1 }; // hors jan intérieur
    const mv = getValidMoves(s, 1);
    expect(mv.every((m) => m.t !== 'off')).toBe(true);
  });
});

describe('applyMove', () => {
  it('coup standard : décrémente source, incrémente destination, consomme dé', () => {
    const s = makeState({ moves: [3, 5] });
    s.pts[10] = { n: 2, p: 1 };
    const ns = applyMove(s, 1, { f: 10, t: 7, d: 3 });
    expect(ns.pts[10]).toEqual({ n: 1, p: 1 });
    expect(ns.pts[7]).toEqual({ n: 1, p: 1 });
    expect(ns.moves).toEqual([5]);
    // immutabilité
    expect(s.pts[10]).toEqual({ n: 2, p: 1 });
    expect(s.moves).toEqual([3, 5]);
  });

  it('si on vide une case, owner repasse à 0', () => {
    const s = makeState({ moves: [3] });
    s.pts[10] = { n: 1, p: 1 };
    const ns = applyMove(s, 1, { f: 10, t: 7, d: 3 });
    expect(ns.pts[10]).toEqual({ n: 0, p: 0 });
  });

  it('hit : blot adverse envoyé sur la barre', () => {
    const s = makeState({ moves: [4] });
    s.pts[10] = { n: 1, p: 1 };
    s.pts[6] = { n: 1, p: 2 };
    const ns = applyMove(s, 1, { f: 10, t: 6, d: 4 });
    expect(ns.pts[6]).toEqual({ n: 1, p: 1 });
    expect(ns.bar[2]).toBe(1);
  });

  it('entrée depuis la barre : décrémente bar, pose en destination', () => {
    const s = makeState({ bar: { 1: 1, 2: 0 }, moves: [3] });
    const ns = applyMove(s, 1, { f: 'bar', t: 21, d: 3 });
    expect(ns.bar[1]).toBe(0);
    expect(ns.pts[21]).toEqual({ n: 1, p: 1 });
  });

  it('bear-off : incrémente off, ne touche pas à pts cible', () => {
    const s = makeState({ moves: [3] });
    s.pts[2] = { n: 1, p: 1 };
    const ns = applyMove(s, 1, { f: 2, t: 'off', d: 3 });
    expect(ns.off[1]).toBe(1);
    expect(ns.pts[2]).toEqual({ n: 0, p: 0 });
  });
});

describe('intégration : un mini-scénario complet', () => {
  it('depuis l’état initial, un coup légal réduit le pip count d’exactement la valeur du dé', () => {
    const s = newGameState();
    s.moves = [3, 5];
    const pipBefore = calcPipCount(s, 1);
    // P1 en 23 peut bouger de 3 → 20 (case vide)
    const ns = applyMove(s, 1, { f: 23, t: 20, d: 3 });
    expect(calcPipCount(ns, 1)).toBe(pipBefore - 3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Règle stricte : use-both-dice + higher-die. C'est ici que `getValidMoves`
// se distingue de `getCandidateMoves`.
// ─────────────────────────────────────────────────────────────────────────────

describe('maxSequenceLength', () => {
  it('renvoie 0 quand aucun dé restant', () => {
    expect(maxSequenceLength(makeState({ moves: [] }), 1)).toBe(0);
  });

  it('renvoie 0 quand aucun coup possible (tous bloqués)', () => {
    const s = makeState({ bar: { 1: 1, 2: 0 }, moves: [3, 5] });
    s.pts[21] = { n: 2, p: 2 }; // d=3 ko
    s.pts[19] = { n: 2, p: 2 }; // d=5 ko
    expect(maxSequenceLength(s, 1)).toBe(0);
  });

  it('renvoie 2 quand une séquence consomme les deux dés', () => {
    // P1 unique en 5, dés [2,4] → 5→3 (d=2) puis 3→off (d=4 overshoot, allHome)
    const s = makeState({ moves: [2, 4] });
    s.pts[5] = { n: 1, p: 1 };
    expect(maxSequenceLength(s, 1)).toBe(2);
  });

  it('renvoie 1 quand un seul dé est jouable et l’autre est bloqué', () => {
    // P1 unique en 10, dés [2,5]. pts[3] bloqué : ni 10→8→3 ni 10→5→3.
    const s = makeState({ moves: [2, 5] });
    s.pts[10] = { n: 1, p: 1 };
    s.pts[3] = { n: 2, p: 2 };
    expect(maxSequenceLength(s, 1)).toBe(1);
  });
});

describe('getValidMoves — règle stricte use-both-dice', () => {
  it('filtre effectivement quand un seul candidat permet d’utiliser un dé', () => {
    // P1 en 7 et 6, dés [6,5]. Toutes les destinations à d=6 sont bloquées
    // par P2 ; seul 7→2 (d=5) est jouable, et après ce coup d=6 reste
    // injouable (pions en 2 et 6, hors home → pas de bear-off). target=1,
    // règle higher-die : higher=6 mais aucun candidat à d=6 → fallback d=5.
    const s = makeState({ moves: [6, 5] });
    s.pts[7] = { n: 1, p: 1 };
    s.pts[6] = { n: 1, p: 1 };
    s.pts[1] = { n: 2, p: 2 };
    s.pts[0] = { n: 2, p: 2 };
    expect(getValidMoves(s, 1)).toEqual([{ f: 7, t: 2, d: 5 }]);
  });

  it('règle higher-die : impose le dé le plus grand quand un seul est jouable', () => {
    // P1 unique en 10, dés [2,5]. d=2 mène à un dead-end (impossible d'enchaîner
    // sur d=5), d=5 mène à un dead-end aussi. maxSeq=1. Higher=5 jouable seul
    // → on doit utiliser le 5.
    const s = makeState({ moves: [2, 5] });
    s.pts[10] = { n: 1, p: 1 };
    s.pts[8] = { n: 2, p: 2 }; // bloque 10→8 (d=2)
    s.pts[3] = { n: 2, p: 2 }; // bloque continuations 5→3 / 8→3
    expect(getValidMoves(s, 1)).toEqual([{ f: 10, t: 5, d: 5 }]);
  });

  it('règle higher-die : si seul le petit dé est jouable, on l’accepte', () => {
    // Même setup mais d=5 bloqué d'entrée et d=2 jouable seul.
    const s = makeState({ moves: [2, 5] });
    s.pts[10] = { n: 1, p: 1 };
    s.pts[5] = { n: 2, p: 2 }; // bloque 10→5 (d=5)
    s.pts[3] = { n: 2, p: 2 }; // bloque 8→3 (d=5 après 10→8 d=2)
    expect(getValidMoves(s, 1)).toEqual([{ f: 10, t: 8, d: 2 }]);
  });

  it('lose-turn : renvoie [] si aucun coup n’est possible', () => {
    const s = makeState({ bar: { 1: 1, 2: 0 }, moves: [3, 5] });
    s.pts[21] = { n: 2, p: 2 };
    s.pts[19] = { n: 2, p: 2 };
    expect(getValidMoves(s, 1)).toEqual([]);
  });

  it('doubles : la règle "higher die" est vacante mais use-both-dice s’applique', () => {
    // P1 unique en 5, dés [3,3,3,3], allHome. 5→2 puis 2→off (exact) :
    // 2 dés consommés, les 2 derniers sont perdus (plus de pions). uniq=[3]
    // donc règle higher-die vacante.
    const s = makeState({ moves: [3, 3, 3, 3] });
    s.pts[5] = { n: 1, p: 1 };
    expect(getValidMoves(s, 1)).toEqual([{ f: 5, t: 2, d: 3 }]);
    expect(maxSequenceLength(s, 1)).toBe(2);
  });
});

describe('getCandidateMoves vs getValidMoves', () => {
  it('candidats ⊇ légaux toujours', () => {
    // Sanity check sur l'état initial avec un roll varié.
    const s = newGameState();
    s.moves = [3, 5];
    const cand = getCandidateMoves(s, 1);
    const legal = getValidMoves(s, 1);
    for (const m of legal) {
      expect(cand).toContainEqual(m);
    }
  });
});
