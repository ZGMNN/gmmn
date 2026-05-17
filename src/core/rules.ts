// src/core/rules.ts
// ─────────────────────────────────────────────────────────────────────────────
// Règles de mouvement : génération, validation, application. Tout est pur —
// `applyMove` renvoie un nouvel état (via `clone`), jamais de mutation
// in-place sur l'argument.
//
// Limitation connue (héritée du legacy) : on ne force pas la règle "use
// both dice if possible". À ajouter quand on tackle la conformité stricte
// FIBS — voir TODO en bas de fichier.
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
 * Liste des coups légaux pour `pl` à partir de l'état courant.
 *  - Tant qu'il y a des pions sur la barre, on n'autorise que les rentrées.
 *  - Sinon : pour chaque pion, on essaie chaque valeur de dé encore dispo.
 *  - Bear-off autorisé uniquement si `allHome`. Overshoot (d > dd) accepté
 *    uniquement depuis le pion le plus éloigné.
 *
 * On dédoublonne les valeurs de dés via `Set` pour éviter de répéter les
 * coups identiques quand on a un double — `applyMove` consomme une instance
 * à la fois, donc on peut rappeler la fonction après chaque coup.
 */
export function getValidMoves(s: GameState, pl: Player): Move[] {
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

// TODO(rules-strict) : implémenter la règle "le joueur doit utiliser les deux
// dés s'il existe une séquence légale qui les consomme tous, et la plus
// grande valeur si une seule peut être jouée". Aujourd'hui un client mal
// intentionné pourrait skipper un dé jouable.
