// src/analytics/ — tracking d'événements typés.
//
// Pattern :
//   track('game_started', { mode: 'ai', difficulty: 'medium' })
//   track('move_made',    { from, to, dieUsed, msSinceTurnStart })
//   track('game_ended',   { winType, points, cubeValue, durationMs })
//
// Backend interchangeable : PostHog (par défaut, RGPD-friendly EU), Mixpanel,
// ou self-hosted via Cloud Functions → BigQuery. Toujours batcher pour limiter
// les requêtes réseau.

export {};
