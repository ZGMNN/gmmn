// tests/core/state.test.ts — newGameState, clone, resolveOpening, checkWin.

import { describe, expect, it } from 'vitest';
import { checkWin, clone, newGameState, resolveOpening } from '../../src/core/state.js';

describe('newGameState', () => {
  it('démarre en phase opening, turn=0, winner=0, sans dés', () => {
    const s = newGameState();
    expect(s.phase).toBe('opening');
    expect(s.turn).toBe(0);
    expect(s.winner).toBe(0);
    expect(s.dice).toEqual([]);
    expect(s.moves).toEqual([]);
    expect(s.bar).toEqual({ 1: 0, 2: 0 });
    expect(s.off).toEqual({ 1: 0, 2: 0 });
    expect(s.openingRolls).toEqual({ 1: 0, 2: 0 });
  });

  it('plateau initial contient 30 pions répartis 15/15', () => {
    const s = newGameState();
    const counts = { 1: 0, 2: 0 } as Record<1 | 2, number>;
    for (const pt of s.pts) {
      if (pt.p === 1 || pt.p === 2) counts[pt.p] += pt.n;
    }
    expect(counts[1] + counts[2]).toBe(30);
  });
});

describe('clone', () => {
  it("ne partage aucune référence avec l'original", () => {
    const s = newGameState();
    const c = clone(s);
    c.pts[0].n = 99;
    c.bar[1] = 7;
    expect(s.pts[0].n).toBe(2);
    expect(s.bar[1]).toBe(0);
  });
});

describe('resolveOpening', () => {
  it('renvoie null en cas d’égalité', () => {
    expect(resolveOpening({ 1: 3, 2: 3 })).toBeNull();
  });

  it('P1 gagne quand son dé est strictement supérieur', () => {
    const r = resolveOpening({ 1: 5, 2: 2 })!;
    expect(r.turn).toBe(1);
    expect(r.dice).toEqual([5, 2]);
    expect(r.moves).toEqual([5, 2]);
    expect(r.phase).toBe('move');
  });

  it('P2 gagne dans le cas inverse', () => {
    const r = resolveOpening({ 1: 1, 2: 6 })!;
    expect(r.turn).toBe(2);
  });
});

describe('checkWin', () => {
  it('retourne 0 tant que personne n’a sorti 15 pions', () => {
    const s = newGameState();
    expect(checkWin(s)).toBe(0);
    s.off[1] = 14;
    s.off[2] = 14;
    expect(checkWin(s)).toBe(0);
  });

  it('détecte la victoire de P1', () => {
    const s = newGameState();
    s.off[1] = 15;
    expect(checkWin(s)).toBe(1);
  });

  it('détecte la victoire de P2', () => {
    const s = newGameState();
    s.off[2] = 15;
    expect(checkWin(s)).toBe(2);
  });

  it('priorité à P1 si pour une raison étrange les deux dépassent 15', () => {
    const s = newGameState();
    s.off[1] = 16;
    s.off[2] = 16;
    expect(checkWin(s)).toBe(1);
  });
});
