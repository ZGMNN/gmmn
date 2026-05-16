// src/ai/ — évaluateurs IA. Interface AIEvaluator stable, implémentations
// remplaçables (greedy local, NN local via tf.js, modèle serveur via Cloud
// Run). Versionnée pour pouvoir comparer les performances par modèle dans
// les stats.

export interface AIEvaluator {
  /** Identifiant unique pour les stats (ex: 'greedy-v1', 'nn-v2', 'server-v1'). */
  readonly id: string;
  /** Difficulté (informatif, choix utilisateur). */
  readonly difficulty: 'easy' | 'medium' | 'hard';
  /** Suggère une séquence de coups à partir d'un état + dés disponibles. */
  suggestMoves(/* state: GameState, dice: number[] */): Promise<unknown>;
}

export {};
