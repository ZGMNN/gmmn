// src/core/state.ts
// ─────────────────────────────────────────────────────────────────────────────
// Constructeurs, clonage, résolution d'ouverture et détection de victoire.
// Pas de mutation : tout reducer renvoie un nouvel état.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  ByPlayer,
  GameState,
  OpeningResolution,
  Player,
  PlayerOrNone,
} from '../types/game.js';
import { initialBoard, P1, P2 } from './board.js';

/** État vierge : plateau de départ, dés non lancés, phase d'ouverture. */
export function newGameState(): GameState {
  return {
    pts: initialBoard(),
    bar: { 1: 0, 2: 0 },
    off: { 1: 0, 2: 0 },
    dice: [],
    moves: [],
    openingRolls: { 1: 0, 2: 0 },
    turn: 0,
    phase: 'opening',
    winner: 0,
  };
}

/**
 * Clone profond de l'état. `GameState` est purement JSON-sérialisable,
 * donc JSON.parse(JSON.stringify(...)) est suffisant et prévisible.
 */
export function clone<T>(s: T): T {
  return JSON.parse(JSON.stringify(s)) as T;
}

/**
 * Résout les lancers d'ouverture en transition vers la phase `move`.
 * Renvoie `null` en cas d'égalité (les deux joueurs doivent relancer).
 */
export function resolveOpening(rolls: ByPlayer<number>): OpeningResolution | null {
  if (rolls[1] === rolls[2]) return null;
  const winner: Player = rolls[1] > rolls[2] ? P1 : P2;
  return {
    dice: [rolls[1], rolls[2]],
    moves: [rolls[1], rolls[2]],
    phase: 'move',
    turn: winner,
  };
}

/** Renvoie le gagnant (1 ou 2) si une partie est terminée, 0 sinon. */
export function checkWin(s: GameState): PlayerOrNone {
  if (s.off[1] >= 15) return 1;
  if (s.off[2] >= 15) return 2;
  return 0;
}
