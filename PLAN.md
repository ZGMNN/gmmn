# GMMN — Roadmap

Document vivant. Cases cochées au fur et à mesure, nouvelles tâches ajoutées en bas de phase.

---

## Phase -1 — Sécurisation de la marque (en parallèle de Phase 0)

**À mener avant toute communication publique** sous le nom GMMN. Détail complet dans [BRANDING.md](BRANDING.md).

### Vérification d'antériorité

- [ ] Recherche INPI (France)
- [ ] Recherche EUIPO (UE)
- [ ] Recherche WIPO (global)
- [ ] Vérification de conflit dans les secteurs logiciel / jeu vidéo / SaaS / IA / divertissement

### Réservation numérique

- [ ] Domaine `gmmn.io` (principal)
- [ ] Domaine `gmmn.com` (protection défensive)
- [ ] Domaine `gmmn.gg` (gaming)
- [ ] Domaine `gm.mn` (domain hack)
- [ ] Domaine `playgmmn.com`
- [ ] Handles sociaux : Twitter/X, Instagram, TikTok, YouTube, Discord, LinkedIn
- [ ] Vérification de disponibilité sur Steam, App Store, Google Play, itch.io

### Dépôt de marque

- [ ] INPI — classes 9 / 41 / 42 — marque verbale + logo (consulter un CPI ou avocat IP)
- [ ] EUIPO — extension européenne (à arbitrer selon scope international)
- [ ] Mise en place d'une surveillance INPI (alerte marques similaires)

### Signature descriptive

- [ ] Arbitrage entre `BCK GMMN` / `PLAY GAMMN` / `ONLINE GMMN` pour la signature publique (SEO + découvrabilité)

---

## Phase 0 — Fondations (~2 semaines)

Mettre en place le harnais propre dans lequel tout le reste va vivre.

### Setup projet

- [x] Squelette initial (TS, Vite, p5, Firebase, Vitest, ESLint optionnel)
- [x] Structure de dossiers `src/{core,render,screens,theme,ai,net,analytics,billing,ads,types}`
- [x] Workflows GitHub Actions (`ci.yml` + `deploy.yml`)
- [x] LICENSE MIT, README, DOCS, PLAN
- [ ] Création du repo GitHub `gmmn` côté @richardrogersnotdead, push initial
- [ ] Branchement Firebase (projet `gmmn-afd53` existant), secrets configurés dans repo
- [ ] Premier déploiement GitHub Pages, vérification que `npm run build` passe

### Transfert du code existant

- [ ] Port `devanture/game/logic_standalone.js` + `app/src/game/logic.js` (mergés) → `src/core/`
- [ ] Port `devanture/game/ai_standalone.js` + `app/src/game/ai.js` → `src/ai/greedy.ts`
- [ ] Port `devanture/adapter.js` (cube, timers, profile struct) → modules séparés dans `src/core/` et `src/screens/game/`
- [ ] Port `devanture/sketch.js` (~5800 lignes) en modules dans `src/render/` et `src/screens/`
- [ ] Copier les assets (fonts PIX-DOT-1/2, nortechico, fond0…6.jpg) dans `assets/`

### Observabilité minimale

- [ ] Wirer Sentry (frontend + Cloud Functions plus tard)
- [ ] Wirer PostHog (events de base : `app_loaded`, `game_started`, `game_ended`)
- [ ] Overlay info build (commit hash, date, version) accessible en bas de l'écran

### Firebase

- [ ] Init via `src/net/config.ts` avec `import.meta.env.VITE_FIREBASE_*`
- [ ] `src/net/auth.ts` — sign-in anonyme, hook current user
- [ ] `src/net/players.ts` — CRUD profil joueur Firestore
- [ ] Firestore Rules de base (lecture publique, écriture restreinte à l'owner)

---

## Phase 1 — Produit complet jouable (~3-4 semaines)

Tout ce qu'un joueur peut faire seul ou contre l'IA doit fonctionner en TypeScript propre. Mode online à porter.

### Modes

- [ ] Mode local (deux joueurs sur le même appareil)
- [ ] Mode AI (greedy, single difficulty pour démarrer)
- [ ] Mode online — porter `app/src/hooks/useOnlineMatch.js` en `src/net/match.ts` + `src/screens/lobby/`
- [ ] Lobby Firebase (presence, invites, accept/decline)

### Stats / profil

- [ ] `appendGame()` Cloud Function sur fin de partie (validation côté serveur)
- [ ] Profil overlay branché à Firestore (`getPlayer(uid)`)
- [ ] Courbe d'évolution score (lecture `scoreHistory`)
- [ ] Pageant des derniers matches (lecture `recentGames`)

### Mobile

- [ ] Capacitor init (`npx cap add ios && npx cap add android`)
- [ ] Build iOS testé sur simulateur, Android sur émulateur
- [ ] Submission TestFlight beta

### Polish

- [ ] Edge cases mode online (deconnexion, reconnexion, abandon adversaire)
- [ ] Sons (optionnel — pré-charger 2-3 effets : dé, pose, hit, victoire)

---

## Phase 2 — Monétisation (~4-6 semaines)

Système complet pour générer du revenu sans dégrader l'expérience.

### Admin panel

- [ ] Nouveau workspace `admin/` (React, séparé du jeu)
- [ ] Auth admin (role-based via custom claims Firebase Auth)
- [ ] CRUD campagnes pub
- [ ] CRUD utilisateurs (ban, reset stats, support)
- [ ] Dashboard impressions / revenus

### Pub douce sur fonds

- [ ] Système de pool de fonds via Storage + métadonnées Firestore
- [ ] Tirage pondéré côté client (`src/ads/picker.ts`)
- [ ] Tracking impressions (Cloud Function batched)
- [ ] Overlay "À propos de ce fond" dans le jeu
- [ ] Premier partenariat test (musée local, festival, etc.)

### Freemium

- [ ] Stripe setup (produits, prix, customer portal)
- [ ] Cloud Function webhook Stripe → `/subscriptions/<uid>`
- [ ] Premium gates dans le client (`src/billing/gates.ts`)
- [ ] Définir précisément les features payantes (skins premium ? stats avancées ? classement global ?)
- [ ] Page tarification + checkout

### Analytics avancées

- [ ] Pipeline PostHog → BigQuery (ou directement Cloud Function → BigQuery)
- [ ] Premiers dashboards Looker Studio / Metabase
- [ ] Onboard équipe commerciale sur les dashboards

---

## Phase 3 — Croissance (open-ended)

À détailler selon ce qui marche.

### IA avancée

- [ ] AIEvaluator NN (TensorFlow.js, exécution locale)
- [ ] AIEvaluator serveur (Cloud Run + GPU pour hard difficulty)
- [ ] Versioning + A/B testing des modèles

### Compétition

- [ ] Classement global (ELO)
- [ ] Tournois (programmation, brackets, prix)
- [ ] Mode spectator

### Distribution

- [ ] App Store + Play Store publication
- [ ] Internationalisation (en, es, autres)
- [ ] PWA installable depuis le web

### Communauté

- [ ] Chat in-game (modération automatique)
- [ ] Discord communautaire
- [ ] Partage social de parties (replay → GIF / vidéo)
