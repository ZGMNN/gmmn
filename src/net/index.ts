// src/net/ — couche d'accès au backend. Encapsule Firebase (Auth, Firestore,
// RTDB, Storage, Functions) derrière des interfaces métier pour permettre
// une migration ultérieure si besoin.
//
// Contenu cible :
//   auth.ts    — sign-in anonyme + email/password + Google/Apple, current user
//   players.ts — CRUD profil joueur, stats, historique
//   match.ts   — sync match online (lobby → invite → partie)
//   lobby.ts   — presence, liste joueurs disponibles
//   storage.ts — upload/lecture assets (backgrounds, sons)
//   config.ts  — initialisation Firebase, lecture VITE_FIREBASE_*

export {};
