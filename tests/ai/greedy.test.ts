// tests/ai/greedy.test.ts — l'IA greedy choisit toujours un coup légal,
// consomme les dés disponibles, et préfère un hit à un coup neutre.

import { describe, expect, it } from 'vitest';
import { aiPlay, evaluate } from '../../src/ai/greedy.js';
import { newGameState } from '../../src/core/state.js';
import type { GameState, Point } from '../../src/types/game.js';

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

describe('evaluate', () => {
  it('mieux noté quand on a sorti des pions', () => {
    const a = makeState();
    const b = makeState({ off: { 1: 5, 2: 0 } });
    expect(evaluate(b, 1)).toBeGreaterThan(evaluate(a, 1));
  });

  it('un pion adverse sur la barre nous avantage', () => {
    const a = makeState();
    const b = makeState({ bar: { 1: 0, 2: 2 } });
    expect(evaluate(b, 1)).toBeGreaterThan(evaluate(a, 1));
  });

  it('nos propres pions sur la barre nous pénalisent', () => {
    const a = makeState();
    const b = makeState({ bar: { 1: 1, 2: 0 } });
    expect(evaluate(b, 1)).toBeLessThan(evaluate(a, 1));
  });
});

describe('aiPlay', () => {
  it('depuis le plateau initial, joue exactement 2 coups sur [3, 5]', () => {
    const s = newGameState();
    s.moves = [3, 5];
    const r = aiPlay(s, 1);
    expect(r.seq).toHaveLength(2);
    expect(r.state.moves).toEqual([]);
  });

  it('depuis le plateau initial, joue 4 coups sur un double', () => {
    const s = newGameState();
    s.moves = [2, 2, 2, 2];
    const r = aiPlay(s, 1);
    expect(r.seq.length).toBeGreaterThan(0);
    expect(r.seq.length).toBeLessThanOrEqual(4);
    expect(r.state.moves.length + r.seq.length).toBe(4);
  });

  it('préfère hitter un blot adverse quand c’est possible', () => {
    // P1 en 10, blot P2 en 7, dé 3. Hit en 7 est meilleur que tout autre coup.
    const s = makeState({ moves: [3] });
    s.pts[10] = { n: 1, p: 1 };
    s.pts[7] = { n: 1, p: 2 };
    const r = aiPlay(s, 1);
    expect(r.seq).toHaveLength(1);
    expect(r.seq[0]).toEqual({ f: 10, t: 7, d: 3 });
    expect(r.state.bar[2]).toBe(1);
  });

  it('s’arrête quand il n’y a plus de coup légal (tous bloqués)', () => {
    const s = makeState({ bar: { 1: 1, 2: 0 }, moves: [3] });
    s.pts[21] = { n: 2, p: 2 }; // entrée 21 bloquée
    const r = aiPlay(s, 1);
    expect(r.seq).toHaveLength(0);
    expect(r.state.moves).toEqual([3]); // dé non consommé
  });

  it('ne mute pas l’état d’entrée', () => {
    const s = newGameState();
    s.moves = [3, 5];
    const snapshot = JSON.stringify(s);
    aiPlay(s, 1);
    expect(JSON.stringify(s)).toBe(snapshot);
  });
});
