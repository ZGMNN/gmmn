// src/types/game.ts
// ─────────────────────────────────────────────────────────────────────────────
// Types de l'état de jeu. Forme conservée à l'identique du legacy JS
// (devanture/game/logic.js) pour rester compatible avec un éventuel
// chargement d'anciens snapshots Firestore.
//
// Convention :
//   - points indexés 0..23, P1 progresse de 23 vers 0, P2 de 0 vers 23
//   - `p` (player) sur un point : 0 = vide, 1 = P1, 2 = P2
//   - bar / off indexés par numéro de joueur (1, 2)
// ─────────────────────────────────────────────────────────────────────────────

/** Identifiant joueur. 0 = aucun (case vide / pas encore de gagnant). */
export type Player = 1 | 2;
export type PlayerOrNone = 0 | Player;

/** Phase de la partie. */
export type Phase = 'opening' | 'move';

/** Un point du plateau : `n` pions de joueur `p` (ou vide). */
export interface Point {
  n: number;
  p: PlayerOrNone;
}

/** Mapping indexé par joueur — pratique pour bar / off / openingRolls. */
export interface ByPlayer<T> {
  1: T;
  2: T;
}

/** Origine d'un coup : index 0..23, ou 'bar' pour entrer depuis la barre. */
export type MoveFrom = number | 'bar';
/** Destination d'un coup : index 0..23, ou 'off' pour sortir (bear-off). */
export type MoveTo = number | 'off';

/** Un coup unitaire (un seul dé consommé). */
export interface Move {
  f: MoveFrom;
  t: MoveTo;
  d: number;
}

/** État complet d'une partie, sérialisable JSON. */
export interface GameState {
  /** 24 points, index 0..23. */
  pts: Point[];
  /** Pions sur la barre par joueur. */
  bar: ByPlayer<number>;
  /** Pions sortis par joueur (vainqueur dès qu'on atteint 15). */
  off: ByPlayer<number>;
  /** Valeurs originales du dernier lancer (length 2 ou 4 en cas de double). */
  dice: number[];
  /** Valeurs encore disponibles pour des coups (consommées par applyMove). */
  moves: number[];
  /** Valeurs lancées en phase d'ouverture par joueur. */
  openingRolls: ByPlayer<number>;
  /** Joueur à qui c'est le tour (0 tant que l'ouverture n'est pas résolue). */
  turn: PlayerOrNone;
  /** Phase courante. */
  phase: Phase;
  /** Gagnant (0 si partie en cours). */
  winner: PlayerOrNone;
}

/** Résultat de `resolveOpening` — sous-ensemble de `GameState` à fusionner. */
export interface OpeningResolution {
  dice: number[];
  moves: number[];
  phase: Phase;
  turn: Player;
}
