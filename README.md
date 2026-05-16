# GMMN

Backgammon dans le navigateur, identité visuelle pixel-arcade. Multijoueur online, stats joueur persistées, fonds de plateau curated. Pensé pour une distribution web + mobile (iOS/Android via Capacitor).

**Statut** : Phase 0 — fondations en cours.

## Quickstart

```bash
# Setup
npm install
cp .env.example .env.local       # remplir les valeurs Firebase

# Dev
npm run dev                       # http://localhost:5173

# Tests + type check
npm run typecheck
npm test

# Build prod
npm run build                     # sortie dans dist/
npm run preview                   # serve dist/ pour vérifier
```

## Stack

- **TypeScript** + **Vite** — bundling, hot reload, types stricts par étapes
- **p5.js** — rendu canvas (board, dés, animations, identité visuelle)
- **Firebase** — Auth + Firestore + Realtime DB + Storage + Functions
- **Vitest** — tests unitaires
- **GitHub Pages** — déploiement statique en attendant un domaine custom

## Organisation

```
src/
  core/        Logique de jeu pure (state, moves, win, dice) — testable
  render/      Dessin p5 (board, checker, dice, modals)
  screens/     State machines des écrans (intro, sign-in, menu, lobby, game)
  theme/       Palette, fonts, extraction hue depuis le fond
  ai/          Interface AIEvaluator + implémentations
  net/         Firebase client (auth, players, match, lobby, storage)
  analytics/   Tracking d'événements typés
  billing/     État abonnement Stripe + gating premium
  ads/         Système de fonds sponsorisés (campagnes + tracking)
  types/       Interfaces partagées
```

Détail dans [DOCS.md](DOCS.md). Roadmap dans [PLAN.md](PLAN.md). Stratégie de marque et sécurisation IP dans [BRANDING.md](BRANDING.md).

## Origine

GMMN reprend le travail accompli sur le prototype [lumpzammon](https://github.com/jpep/lumpzammon) (par [@jpep](https://github.com/jpep)). La skin p5.js développée dans `devanture/` de ce projet a démontré la viabilité de l'approche tout-canvas ; GMMN est son successeur restructuré pour la maintenabilité long-terme et la scalabilité produit.

## License

MIT — voir [LICENSE](LICENSE).
