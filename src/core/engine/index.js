// src/core/engine/index.js

import { initWebGL } from './renderer.js';
import { setupInteraction } from './interaction.js';
import { renderCube } from './renderer.js'; // ⬅️ Penting! Tambahkan baris ini

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('webgl-canvas');
  const gl = initWebGL(canvas);
  if (!gl) return;

  setupInteraction(canvas, gl);

  function renderLoop() {
    renderCube(gl); // ✅ Sekarang fungsi ini tersedia
    requestAnimationFrame(renderLoop);
  }

  renderLoop();
});