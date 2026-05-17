// src/core/rules.ts
// ─────────────────────────────────────────────────────────────────────────────
// Règles de mouvement : génération, validation, application. Tout est pur —
// `applyMove` renvoie un nouvel état (via `clone`), jamais de mutation
// in-place sur l'argument.
//
// Architecture en deux étages :
//   - `getCandidateMoves` : générateur "brut" — tous les coups physiquement
//     possibles (entrée depuis la barre, déplacement, bear-off) sans tenir
//     compte des règles de séquence.
//   - `getValidMoves`     : règle stricte de backgammon par-dessus. Filtre
//     pour ne garder que les coups qui font partie d'une séquence consommant
//     le maximum de dés possible, et applique la règle "use the higher die
//     when only one can be played".
//
// Les callers (UI, IA, validation serveur) doivent utiliser `getValidMoves`.
// `getCandidateMoves` reste exporté pour le debug et l'outillage.
// ─────────────────────────────────────────────────────────────────────────────

import type { GameState, Move, Player, Point } from '../types/game.js';
import { clone } from './state.js';

/**
 * Vrai si le joueur `pl` peut poser sur l'index `i` :
 * case vide, sa propre case, ou blot adverse (n=1 → on hit).
 */
export function canLand(pts: Point[], i: number, pl: Player): boolean {
  return pts[i].p === 0 || pts[i].p === pl || pts[i].n <= 1;
}

/**
 * Vrai si tous les pions de `pl` sont dans son jan intérieur
 * (P1 : 0..5, P2 : 18..23) et qu'aucun n'est sur la barre.
 * Pré-requis pour pouvoir sortir des pions.
 */
export function allHome(s: GameState, pl: Player): boolean {
  if (s.bar[pl] > 0) return false;
  const [lo, hi] = pl === 1 ? [0, 5] : [18, 23];
  for (let i = 0; i < 24; i++) {
    if (s.pts[i].p === pl && s.pts[i].n > 0 && (i < lo || i > hi)) {
      return false;
    }
  }
  return true;
}

/**
 * Distance restante (en pips) entre l'index `i` et la sortie de `pl`.
 * P1 sort par "−1" (donc dist = i+1), P2 sort par "24" (donc dist = 24-i).
 */
export function pipDist(i: number, pl: Player): number {
  return pl === 1 ? i + 1 : 24 - i;
}

/** Pip count total d'un joueur (pions sur barre comptés à 25). */
export function calcPipCount(s: GameState, pl: Player): number {
  let total = 0;
  for (let i = 0; i < 24; i++) {
    if (s.pts[i].p === pl && s.pts[i].n > 0) {
      total += pipDist(i, pl) * s.pts[i].n;
    }
  }
  total += s.bar[pl] * 25;
  return total;
}

/**
 * Index du pion de `pl` le plus éloigné de sa zone de sortie (pour la règle
 * "overshoot" en bear-off). Renvoie -1 si aucun pion en jan intérieur.
 */
export function farthestHome(s: GameState, pl: Player): number {
  const [lo, hi] = pl === 1 ? [0, 5] : [18, 23];
  if (pl === 1) {
    for (let i = hi; i >= lo; i--) {
      if (s.pts[i].p === pl && s.pts[i].n > 0) return i;
    }
  } else {
    for (let i = lo; i <= hi; i++) {
      if (s.pts[i].p === pl && s.pts[i].n > 0) return i;
    }
  }
  return -1;
}

/**
 * Coups "candidats" pour `pl` — générateur brut sans application de la règle
 * de séquence (use-both-dice, higher-die). À n'utiliser que comme building
 * block de `getValidMoves` ou pour du debug ; côté UI / IA / validation
 * serveur, prendre `getValidMoves` à la place.
 *
 *  - Tant qu'il y a des pions sur la barre, on n'autorise que les rentrées.
 *  - Sinon : pour chaque pion, on essaie chaque valeur de dé encore dispo.
 *  - Bear-off autorisé uniquement si `allHome`. Overshoot (d > dd) accepté
 *    uniquement depuis le pion le plus éloigné.
 *
 * On dédoublonne les valeurs de dés via `Set` pour éviter de répéter les
 * coups identiques quand on a un double — `applyMove` consomme une instance
 * à la fois, donc on peut rappeler la fonction après chaque coup.
 */
export function getCandidateMoves(s: GameState, pl: Player): Move[] {
  const mv: Move[] = [];
  const u = [...new Set(s.moves)];

  if (s.bar[pl] > 0) {
    for (const d of u) {
      const t = pl === 1 ? 24 - d : d - 1;
      if (t >= 0 && t < 24 && canLand(s.pts, t, pl)) {
        mv.push({ f: 'bar', t, d });
      }
    }
    return mv;
  }

  const ah = allHome(s, pl);
  for (let i = 0; i < 24; i++) {
    if (s.pts[i].p !== pl || s.pts[i].n === 0) continue;
    for (const d of u) {
      const t = pl === 1 ? i - d : i + d;
      if (t >= 0 && t < 24 && canLand(s.pts, t, pl)) {
        mv.push({ f: i, t, d });
      } else if (ah && (t < 0 || t > 23)) {
        const dd = pipDist(i, pl);
        if (dd === d) {
          mv.push({ f: i, t: 'off', d });
        } else if (dd < d && farthestHome(s, pl) === i) {
          mv.push({ f: i, t: 'off', d });
        }
      }
    }
  }
  return mv;
}

/**
 * Longueur de la plus longue séquence légale de coups jouable depuis l'état
 * courant (DFS sur les candidats, déduplication des branches équivalentes).
 *
 * Coûteux dans l'absolu (branching × profondeur jusqu'à 4 pour un double),
 * mais en pratique le branching est faible et l'early-exit via
 * `best >= s.moves.length` coupe court dès qu'on a trouvé une séquence
 * complète. Pas de mémoïsation : la fonction est appelée au plus une fois
 * par tour côté UI/IA, et le gain ne justifie pas la complexité.
 */
export function maxSequenceLength(s: GameState, pl: Player): number {
  if (s.moves.length === 0) return 0;
  const cand = getCandidateMoves(s, pl);
  if (cand.length === 0) return 0;

  let best = 0;
  const seen = new Set<string>();
  for (const m of cand) {
    const key = `${String(m.f)}|${String(m.t)}|${m.d}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const ns = applyMove(s, pl, m);
    const sub = 1 + maxSequenceLength(ns, pl);
    if (sub > best) best = sub;
    if (best >= s.moves.length) break;
  }
  return best;
}

/**
 * Coups *légaux* pour `pl` — `getCandidateMoves` filtré par la règle stricte
 * de séquence du backgammon :
 *
 *   1. On ne garde que les coups qui peuvent être prolongés en une séquence
 *      consommant `maxSequenceLength(s, pl)` dés au total. Autrement dit :
 *      si une séquence permet d'utiliser les deux dés, on n'autorise pas un
 *      premier coup qui rendrait le second impossible.
 *
 *   2. Cas particulier (non-doubles, un seul dé jouable au total) : on doit
 *      utiliser le dé le plus élevé si possible. Si seul le petit est
 *      jouable, on n'a pas le choix.
 *
 * Pour un double, s.moves est `[d,d,d,d]` — la règle "higher die" est
 * vacante (un seul dé distinct), seule la règle (1) s'applique.
 *
 * Si aucune séquence n'existe (target = 0), le joueur perd son tour : on
 * renvoie un tableau vide et le caller fait avancer le `turn`.
 */
export function getValidMoves(s: GameState, pl: Player): Move[] {
  const cand = getCandidateMoves(s, pl);
  if (cand.length === 0) return [];

  const target = maxSequenceLength(s, pl);
  if (target === 0) return [];

  // (1) Garde seulement les coups qui prolongent à la longueur maximale.
  const extending = cand.filter((m) => {
    const ns = applyMove(s, pl, m);
    return 1 + maxSequenceLength(ns, pl) >= target;
  });

  // (2) Règle "higher die" — non-doubles, les deux dés encore pendants,
  // et seul un des deux est jouable seul.
  const uniq = [...new Set(s.moves)];
  if (target === 1 && uniq.length === 2) {
    const high = Math.max(...uniq);
    const highUsable = extending.some((m) => m.d === high);
    if (highUsable) {
      return extending.filter((m) => m.d === high);
    }
  }

  return extending;
}

/**
 * Applique un coup et renvoie le nouvel état (pur).
 * Hypothèse : `m` est un coup légal — pas de revalidation ici, c'est le rôle
 * du caller (qui doit l'avoir pris depuis `getValidMoves`).
 */
export function applyMove(s: GameState, pl: Player, m: Move): GameState {
  const ns = clone(s);

  // 1. Retrait du pion source.
  if (m.f === 'bar') {
    ns.bar[pl]--;
  } else {
    ns.pts[m.f].n--;
    if (ns.pts[m.f].n === 0) ns.pts[m.f].p = 0;
  }

  // 2. Pose à la destination (ou sortie).
  if (m.t === 'off') {
    ns.off[pl]++;
  } else {
    const op: Player = pl === 1 ? 2 : 1;
    // Hit : blot adverse → envoyé sur la barre.
    if (ns.pts[m.t].p === op && ns.pts[m.t].n === 1) {
      ns.pts[m.t].n = 0;
      ns.pts[m.t].p = 0;
      ns.bar[op]++;
    }
    ns.pts[m.t].n++;
    ns.pts[m.t].p = pl;
  }

  // 3. Consommation d'une instance du dé utilisé.
  const idx = ns.moves.indexOf(m.d);
  if (idx !== -1) ns.moves.splice(idx, 1);

  return ns;
}
