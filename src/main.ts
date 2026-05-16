// src/main.ts
// ─────────────────────────────────────────────────────────────────────────────
// Entrée unique du projet. Crée une instance p5 en mode "instance" (vs global)
// pour rester compatible TypeScript / Vite / modules ES — pas de pollution
// du scope global, p5 est passé en paramètre aux callbacks.
//
// À mesure que les screens / render / core sont écrits, ils seront importés
// ici et l'entrée déléguera au screen courant.
// ─────────────────────────────────────────────────────────────────────────────

import p5 from 'p5';

new p5((p: p5) => {
  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
  };

  p.draw = () => {
    p.background(0);

    // Provisoire : preuve que le bootstrap fonctionne.
    p.fill(255, 200, 60);
    p.textSize(Math.min(p.width, p.height) * 0.15);
    p.text('GMMN', p.width / 2, p.height / 2);

    p.fill(180);
    p.textSize(Math.min(p.width, p.height) * 0.025);
    p.text('skeleton — Phase 0', p.width / 2, p.height / 2 + p.height * 0.12);
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
});
