// src/core/ — logique de jeu pure, sans dépendance au rendu.
//
// Décomposition :
//   - board.ts  : plateau initial + tables d'index visuels
//   - dice.ts   : lancers (acceptent un RNG injectable pour les tests)
//   - state.ts  : constructeurs / clone / opening / win
//   - rules.ts  : génération + application des coups
//
// Cette couche est 100% testable en isolation (Vitest), aucun import de p5
// ni de Firebase.

export * from './board.js';
export * from './dice.js';
export * from './state.js';
export * from './rules.js';
export type {
  ByPlayer,
  GameState,
  Move,
  MoveFrom,
  MoveTo,
  OpeningResolution,
  Phase,
  Player,
  PlayerOrNone,
  Point,
} from '../types/game.js';
