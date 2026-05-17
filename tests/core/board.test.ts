// tests/core/board.test.ts — propriétés invariantes du plateau initial.

import { describe, expect, it } from 'vitest';
import { BOT_IDX, TOP_IDX, getBoardIndices, initialBoard } from '../../src/core/board.js';

describe('initialBoard', () => {
  it('crée 24 points indexés 0..23', () => {
    const b = initialBoard();
    expect(b).toHaveLength(24);
    for (const pt of b) {
      expect(pt).toHaveProperty('n');
      expect(pt).toHaveProperty('p');
    }
  });

  it('place exactement 15 pions par joueur', () => {
    const b = initialBoard();
    const counts = { 1: 0, 2: 0 } as Record<1 | 2, number>;
    for (const pt of b) {
      if (pt.p === 1 || pt.p === 2) counts[pt.p] += pt.n;
    }
    expect(counts[1]).toBe(15);
    expect(counts[2]).toBe(15);
  });

  it('respecte la disposition standard du backgammon', () => {
    const b = initialBoard();
    // P1
    expect(b[23]).toEqual({ n: 2, p: 1 });
    expect(b[12]).toEqual({ n: 5, p: 1 });
    expect(b[7]).toEqual({ n: 3, p: 1 });
    expect(b[5]).toEqual({ n: 5, p: 1 });
    // P2 (miroir)
    expect(b[0]).toEqual({ n: 2, p: 2 });
    expect(b[11]).toEqual({ n: 5, p: 2 });
    expect(b[16]).toEqual({ n: 3, p: 2 });
    expect(b[18]).toEqual({ n: 5, p: 2 });
  });

  it('renvoie des objets indépendants à chaque appel (pas de partage)', () => {
    const a = initialBoard();
    const b = initialBoard();
    a[0].n = 99;
    expect(b[0].n).toBe(2);
  });
});

describe('getBoardIndices', () => {
  it('orientation par défaut renvoie TOP_IDX / BOT_IDX standards', () => {
    const { topIdx, botIdx } = getBoardIndices(0);
    expect(topIdx).toEqual(TOP_IDX);
    expect(botIdx).toEqual(BOT_IDX);
  });

  it("orientation flip ne se chevauche pas avec l'orientation standard", () => {
    const std = getBoardIndices(0);
    const flip = getBoardIndices(1);
    expect(flip.topIdx).not.toEqual(std.topIdx);
    expect(flip.botIdx).not.toEqual(std.botIdx);
  });

  it("contient toujours un null en position 6 (emplacement de la barre)", () => {
    for (const dir of [0, 1] as const) {
      const { topIdx, botIdx } = getBoardIndices(dir);
      expect(topIdx[6]).toBeNull();
      expect(botIdx[6]).toBeNull();
    }
  });

  it("couvre les 24 points (12 sur top + 12 sur bot, hors null)", () => {
    for (const dir of [0, 1] as const) {
      const { topIdx, botIdx } = getBoardIndices(dir);
      const all = [...topIdx, ...botIdx].filter((x): x is number => x !== null);
      expect(new Set(all).size).toBe(24);
    }
  });
});
