// tests/smoke.test.ts — vérifie juste que le harnais de tests fonctionne.
// À remplacer par des tests métier dès que core/ contient de la logique.

import { describe, expect, it } from 'vitest';

describe('smoke', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
