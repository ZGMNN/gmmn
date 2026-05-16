// src/types/ — interfaces partagées entre modules. Tout ce qui transite à
// travers les frontières (core ↔ render, net ↔ analytics, etc.) y est typé
// explicitement pour servir de contrat stable.

/** Couleur du joueur. Convention : white = joueur 1 (P1), black = joueur 2 (P2). */
export type Color = 'white' | 'black';

/** Type d'issue d'une partie. */
export type WinType = 'simple' | 'gammon' | 'backgammon' | 'resign';

/** Mode de jeu. */
export type GameMode = 'local' | 'ai' | 'online';

/** Difficulté IA (mappée à un AIEvaluator). */
export type Difficulty = 'easy' | 'medium' | 'hard';

/** Profil joueur tel que stocké dans Firestore /players/<uid>. */
export interface PlayerProfile {
  uid: string;
  nick: string;
  firstPlay: string;        // ISO datetime
  totalGames: number;
  wins: number;
  winPercent: number;       // 0..1
  recentGames: RecentGame[];
  scoreHistory: ScoreHistoryPoint[];
}

export interface RecentGame {
  youScore: number;
  oppScore: number;
  opponent: string;
  delta: number;
  playedAt: string;         // ISO datetime
}

export interface ScoreHistoryPoint {
  date: string;             // YYYY-MM-DD
  score: number;            // cumulé
}
