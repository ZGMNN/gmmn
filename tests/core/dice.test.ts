// tests/core/dice.test.ts — RNG déterministe via injection.

import { describe, expect, it } from 'vitest';
import { rollDice, rollOpeningDice, rollSingleDie } from '../../src/core/dice.js';

/** Petit générateur séquentiel à partir d'une liste de valeurs prédéfinies. */
function seq(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

describe('rollSingleDie', () => {
  it('renvoie toujours un entier 1..6', () => {
    for (let i = 0; i < 1000; i++) {
      const d = rollSingleDie();
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(6);
      expect(Number.isInteger(d)).toBe(true);
    }
  });

  it('mappe les bornes du RNG (0 → 1, ~0.9999 → 6)', () => {
    expect(rollSingleDie(() => 0)).toBe(1);
    expect(rollSingleDie(() => 0.9999)).toBe(6);
  });
});

describe('rollDice', () => {
  it('renvoie [a, b] quand les dés diffèrent', () => {
    // RNG donnera 0 (→ 1) puis 5/6 (→ 6)
    const r = rollDice(seq([0, 5 / 6]));
    expect(r).toEqual([1, 6]);
  });

  it('renvoie [a, a, a, a] sur un double', () => {
    const r = rollDice(seq([0, 0])); // 1 et 1
    expect(r).toEqual([1, 1, 1, 1]);
  });
});

describe('rollOpeningDice', () => {
  it('rejoue tant que les deux valeurs sont égales', () => {
    // 1+1 (égalité → relance), 1+1 (idem), 1+6
    const r = rollOpeningDice(seq([0, 0, 0, 0, 0, 5 / 6]));
    expect(r[1]).toBe(1);
    expect(r[2]).toBe(6);
  });

  it('renvoie une paire différente directement quand le RNG ne collide pas', () => {
    const r = rollOpeningDice(seq([0, 5 / 6]));
    expect(r[1]).not.toBe(r[2]);
  });
});
