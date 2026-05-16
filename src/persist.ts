// src/persist.ts — wrappers localStorage typés, pour les préférences
// client-only (nick courant, fenêtre du dernier mode, mute son, etc.).
// Aucune donnée joueur persistée ici — ça vit dans Firebase.

const PREFIX = 'gmmn:';

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* quota plein ou mode incognito — silencieux */
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    /* idem */
  }
}
