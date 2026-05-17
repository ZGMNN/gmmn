// src/ai/greedy.ts
// ─────────────────────────────────────────────────────────────────────────────
// IA greedy de base : à chaque dé restant, choisit le coup qui maximise une
// fonction d'évaluation simple. Pas de lookahead, pas de simulation des
// futurs lancers — c'est volontaire (vitesse + comportement prévisible
// pour débugger). Suffisant comme baseline "easy".
//
// L'évaluation est volontairement naïve :
//   +25 par pion sorti
//   +18 par pion adverse sur la barre
//   −25 par pion à soi sur la barre
//   +5  par point sécurisé (n ≥ 2)
//   −10 par blot dans le jan adverse (très risqué)
//   −4  par blot ailleurs
//   +0.5 par pip d'avance dans la "course" (heuristique douce de progression)
//
// Ces poids viennent de devanture/game/ai.js et n'ont pas été retunés.
// ─────────────────────────────────────────────────────────────────────────────

import { applyMove, getValidMoves, pipDist } from '../core/rules.js';
import { clone } from '../core/state.js';
import type { GameState, Move, Player } from '../types/game.js';

/** Score heuristique de l'état `s` du point de vue de `pl` (plus = mieux). */
export function evaluate(s: GameState, pl: Player): number {
  let sc = 0;
  const op: Player = pl === 1 ? 2 : 1;

  sc += s.off[pl] * 25;
  sc += s.bar[op] * 18;
  sc -= s.bar[pl] * 25;

  for (let i = 0; i < 24; i++) {
    if (s.pts[i].p !== pl) continue;
    if (s.pts[i].n >= 2) sc += 5;
    if (s.pts[i].n === 1) {
      const [lo, hi] = op === 1 ? [0, 5] : [18, 23];
      sc += i >= lo && i <= hi ? -10 : -4;
    }
    sc += (7 - pipDist(i, pl)) * 0.5;
  }
  return sc;
}

/** Résultat d'une séquence de coups jouée par l'IA. */
export interface AiPlayResult {
  /** Coups choisis, dans l'ordre, à rejouer côté UI pour animer. */
  seq: Move[];
  /** État final après application de toute la séquence. */
  state: GameState;
}

/**
 * Joue le tour de `pl` : tant qu'il reste des dés et au moins un coup légal,
 * choisit le meilleur coup selon `evaluate`. Renvoie la séquence + l'état
 * final. Le caller décide ensuite quand changer de tour.
 */
export function aiPlay(s: GameState, pl: Player): AiPlayResult {
  let cur = clone(s);
  const seq: Move[] = [];

  while (cur.moves.length > 0) {
    const vm = getValidMoves(cur, pl);
    if (vm.length === 0) break;

    let bestMove: Move = vm[0];
    let bestScore = -Infinity;
    for (const m of vm) {
      const ns = applyMove(cur, pl, m);
      const sc = evaluate(ns, pl);
      if (sc > bestScore) {
        bestScore = sc;
        bestMove = m;
      }
    }

    seq.push(bestMove);
    cur = applyMove(cur, pl, bestMove);
  }

  return { seq, state: cur };
}
