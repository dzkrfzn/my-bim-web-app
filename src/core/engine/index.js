import { initWebGL } from './renderer.js';
import { setupInteraction } from './interaction.js';
import { renderCube } from './renderer.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('webgl-canvas');
  const gl = initWebGL(canvas);
  if (!gl) return;

  setupInteraction(canvas, gl);

  function renderLoop() {
    renderCube(gl);
    requestAnimationFrame(renderLoop);
  }

  renderLoop();
});