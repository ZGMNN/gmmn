// src/ai/ — évaluateurs IA. Interface AIEvaluator stable, implémentations
// remplaçables (greedy local, NN local via tf.js, modèle serveur via Cloud
// Run). Versionnée pour pouvoir comparer les performances par modèle dans
// les stats.

import type { GameState, Move, Player } from '../types/game.js';

export interface AIEvaluator {
  /** Identifiant unique pour les stats (ex: 'greedy-v1', 'nn-v2', 'server-v1'). */
  readonly id: string;
  /** Difficulté (informatif, choix utilisateur). */
  readonly difficulty: 'easy' | 'medium' | 'hard';
  /** Suggère une séquence de coups à partir d'un état + dés disponibles. */
  suggestMoves(state: GameState, pl: Player): Promise<{ seq: Move[]; state: GameState }>;
}

export { aiPlay, evaluate } from './greedy.js';
export type { AiPlayResult } from './greedy.js';

import { aiPlay } from './greedy.js';

/** Implémentation par défaut pour la difficulté "easy". */
export const greedyEvaluator: AIEvaluator = {
  id: 'greedy-v1',
  difficulty: 'easy',
  async suggestMoves(state, pl) {
    return aiPlay(state, pl);
  },
};
