// src/ads/ — système de "pub douce" : fonds de plateau sponsorisés.
//
// Pas de réseau publicitaire externe. Système custom :
//   - Pool de fonds (Storage) avec métadonnées (artiste, musée, copyright,
//     campagne, poids, dates de campagne) dans Firestore
//   - Tirage pondéré au début de chaque partie selon campagnes actives
//   - Tracking d'impressions (anonyme, agrégé) pour facturation
//   - Petit overlay "À propos de ce fond" (artiste, lien, infos) accessible
//     depuis le jeu, jamais intrusif
//
// Contenu cible : campaigns.ts (lecture campagnes actives), picker.ts
// (tirage pondéré), impressions.ts (tracking), attribution.ts (overlay info).

export {};
