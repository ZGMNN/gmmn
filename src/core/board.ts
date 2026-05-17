// src/core/board.ts
// ─────────────────────────────────────────────────────────────────────────────
// Plateau initial + tables d'index visuels (top / bottom). La logique de jeu
// ne dépend que de `initialBoard()` ; les `*_IDX` servent au rendu pour
// projeter les 24 points sur les deux rangées du sketch.
// ─────────────────────────────────────────────────────────────────────────────

import type { Point } from '../types/game.js';

/** Constantes joueurs — réexportées par commodité depuis les call sites. */
export const P1 = 1 as const;
export const P2 = 2 as const;

/** Index par défaut : P2 (orientation "normale"). `null` = position de la barre. */
export const TOP_IDX: readonly (number | null)[] = [12, 13, 14, 15, 16, 17, null, 18, 19, 20, 21, 22, 23];
export const BOT_IDX: readonly (number | null)[] = [11, 10, 9, 8, 7, 6, null, 5, 4, 3, 2, 1, 0];

/** Index inversés 180° pour les vues côté P1 (bottom devient top, etc.). */
const TOP_IDX_FLIP: readonly (number | null)[] = [0, 1, 2, 3, 4, 5, null, 6, 7, 8, 9, 10, 11];
const BOT_IDX_FLIP: readonly (number | null)[] = [23, 22, 21, 20, 19, 18, null, 17, 16, 15, 14, 13, 12];

/**
 * Renvoie la projection visuelle des 24 points selon l'orientation `dir`.
 * `dir === 1` retourne la vue inversée (utile quand on affiche du point de vue
 * de P1 sur un écran orienté normalement).
 */
export function getBoardIndices(dir: 0 | 1): {
  topIdx: readonly (number | null)[];
  botIdx: readonly (number | null)[];
} {
  return dir === 1
    ? { topIdx: TOP_IDX_FLIP, botIdx: BOT_IDX_FLIP }
    : { topIdx: TOP_IDX, botIdx: BOT_IDX };
}

/**
 * Plateau de départ standard : 15 pions par joueur, positionnés en miroir.
 *  - P1 : 2@23, 5@12, 3@7,  5@5
 *  - P2 : 2@0,  5@11, 3@16, 5@18
 */
export function initialBoard(): Point[] {
  const p: Point[] = Array.from({ length: 24 }, () => ({ n: 0, p: 0 }));
  p[23] = { n: 2, p: 1 }; p[12] = { n: 5, p: 1 };
  p[7]  = { n: 3, p: 1 }; p[5]  = { n: 5, p: 1 };
  p[0]  = { n: 2, p: 2 }; p[11] = { n: 5, p: 2 };
  p[16] = { n: 3, p: 2 }; p[18] = { n: 5, p: 2 };
  return p;
}
