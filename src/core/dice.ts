// src/core/dice.ts
// ─────────────────────────────────────────────────────────────────────────────
// Lancers de dés. Toutes les fonctions acceptent un `rng` injectable pour
// permettre des tests déterministes ; par défaut on utilise `Math.random`.
// ─────────────────────────────────────────────────────────────────────────────

import type { ByPlayer } from '../types/game.js';

/** RNG uniforme sur [0,1). */
export type RNG = () => number;

const defaultRng: RNG = Math.random;

/** Lance un dé : entier 1..6. */
export function rollSingleDie(rng: RNG = defaultRng): number {
  return Math.floor(rng() * 6) + 1;
}

/**
 * Lance les deux dés du tour.
 *  - paire de différents : `[a, b]`
 *  - double : `[a, a, a, a]` (les doubles donnent 4 coups au backgammon)
 */
export function rollDice(rng: RNG = defaultRng): number[] {
  const a = rollSingleDie(rng);
  const b = rollSingleDie(rng);
  return a === b ? [a, a, a, a] : [a, b];
}

/**
 * Lance les dés d'ouverture en local : chaque joueur lance un dé,
 * on rejoue tant qu'il y a égalité (cf. règle officielle).
 */
export function rollOpeningDice(rng: RNG = defaultRng): ByPlayer<number> {
  let a: number;
  let b: number;
  do {
    a = rollSingleDie(rng);
    b = rollSingleDie(rng);
  } while (a === b);
  return { 1: a, 2: b };
}
