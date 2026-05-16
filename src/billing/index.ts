// src/billing/ — état d'abonnement Stripe + premium gates.
//
// La source de vérité est côté serveur (Stripe webhooks → Cloud Function →
// /players/<uid>/subscription dans Firestore). Le client lit l'état et
// gate les features payantes (skins premium, stats avancées, classement
// global, etc.). Jamais de tarification ni de validation côté client.
//
// Contenu cible : subscription.ts (lecture état), gates.ts (helpers
// isPremium, hasFeature), portal.ts (lien vers Customer Portal Stripe).

export {};
