# GMMN — Documentation Architecture

Document vivant. Mis à jour à chaque changement structurant.

## Vision

Jeu de backgammon dans le navigateur, jouable seul (contre IA), à deux en local, ou en ligne contre un autre joueur. Identité visuelle pixel-arcade affirmée. Pensé pour passer du web à des apps iOS/Android (via Capacitor) sans réécrire le rendu. Monétisation par "pub douce" (fonds sponsorisés peu intrusifs) + freemium.

## Stack

| Couche | Choix | Pourquoi |
|---|---|---|
| Langage | TypeScript | Contrats stables, refactor sereins, tooling éditeur |
| Build | Vite | Imports ES modules, env vars par environnement, code splitting, dev rapide |
| Rendu | p5.js (mode instance) | Canvas pixel-art, animations 60 FPS, identité visuelle |
| Backend | Firebase (Auth + Firestore + RTDB + Storage + Functions) | Real-time, scalable jusqu'à plusieurs dizaines de milliers de MAU, infra gérée |
| Tests | Vitest | Compatible Vite, rapide, API Jest-like |
| Hébergement | GitHub Pages (provisoire) → Firebase Hosting ou Cloudflare Pages | CDN global, preview channels |
| Erreurs | Sentry | Visibilité prod, free tier confortable |
| Analytics | PostHog (EU, RGPD-friendly) → BigQuery quand le volume justifie | Tracking événements typés |
| Paiement | Stripe | Customer portal natif, webhooks fiables |
| Mobile | Capacitor | Wrap WebView, ~95% de code partagé |
| IaC | Terraform (Phase 2+) | Reproductibilité des environnements |

## Organisation du code

```
gmmn/
├── src/
│   ├── core/         Logique de jeu pure (testable, sans dépendances UI ni réseau)
│   ├── render/       Primitives p5 (board, checker, dice, modals, overlays)
│   ├── screens/      State machines des écrans
│   ├── theme/        Palette, fonts, extraction hue
│   ├── ai/           AIEvaluator interface + impls (greedy, NN, server)
│   ├── net/          Firebase client encapsulé derrière interfaces métier
│   ├── analytics/    Tracking événements typés (batched)
│   ├── billing/      Subscription state + premium gates
│   ├── ads/          Système custom de fonds sponsorisés
│   ├── types/        Interfaces partagées
│   ├── persist.ts    localStorage wrappers (préférences client-only)
│   └── main.ts       Entrée — instancie p5, sélectionne le screen
├── tests/            Vitest (unit + integration)
├── assets/           Fonts, backgrounds, icons
├── .github/workflows/
│   ├── ci.yml        Type check + tests + build smoke sur chaque PR
│   └── deploy.yml    Build + deploy GitHub Pages sur push to main
└── public/           (optionnel) assets servis tel quel par Vite
```

## Schémas de données Firebase

À détailler à mesure que les collections sont créées. Principaux namespaces prévus :

### `/players/<uid>` — Firestore
Profil joueur, stats agrégées, historique léger. Source de vérité pour ce qui s'affiche dans le profil overlay.

```ts
{
  uid: string;
  nick: string;
  firstPlay: Timestamp;
  totalGames: number;
  wins: number;
  winPercent: number;        // dénormalisé pour lecture rapide
  recentGames: RecentGame[]; // capé à 50, append-only par Cloud Function
  scoreHistory: ...;          // pour la courbe d'évolution
}
```

### `/matches/<matchId>` — Realtime Database
État de partie online en cours. Synchro real-time entre les deux joueurs. Supprimé en fin de partie par Cloud Function.

### `/lobby/presence/<uid>` — Realtime Database
Disponibilité du joueur. TTL court (déconnexion = absence).

### `/campaigns/<campaignId>` — Firestore
Campagne pub douce. Géré via admin panel par l'équipe commerciale.

```ts
{
  id: string;
  partnerName: string;        // 'Musée d'Orsay', 'Festival de Cannes', ...
  startDate: Timestamp;
  endDate: Timestamp;
  weight: number;             // poids pour le tirage (proportionnel au tarif)
  backgrounds: string[];      // refs Storage
  attribution: { ... };       // overlay info affiché dans le jeu
  impressionTarget?: number;  // facturation au CPM si applicable
}
```

### `/subscriptions/<uid>` — Firestore
État abonnement Stripe, écrit côté serveur uniquement par webhook.

## Sécurité

Source unique de vérité : les Firestore Rules + RTDB Rules. Jamais de validation business côté client. Les Firebase web API keys sont publiques par design.

## Observabilité

| Outil | Rôle |
|---|---|
| Sentry | Erreurs JS (frontend + Cloud Functions) |
| PostHog | Tracking produit (funnels, rétention, A/B tests) |
| BigQuery (Phase 2+) | Analytics ad-hoc, requêtes data team |
| Cloud Logging | Logs Cloud Functions / serveur |

## Mobile

L'app web tourne en WebView via Capacitor (Phase 2-3). Build natif produit `.ipa` (iOS) et `.apk` (Android) à partir du même code. Les API natives (push, in-app purchase, share) sont accessibles via plugins JS officiels.

## Stratégie de releases

| Environnement | Branche / source | URL | Quand |
|---|---|---|---|
| Local | feature/* | localhost:5173 | Dev quotidien |
| Preview | PR | preview deploy Pages ou Firebase Hosting channel | Sur chaque PR |
| Prod | main | site public | Sur merge to main |

## Versioning

SemVer pour le `package.json`. Tag git `v0.x.x` à chaque release significative. CHANGELOG.md (à venir) suivra [Keep a Changelog](https://keepachangelog.com/).
