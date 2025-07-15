import { initWebGL } from './renderer.js';
import { setupInteraction } from './interaction.js';
import { renderCube } from './renderer.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('webgl-canvas');
  const gl = initWebGL(canvas);
  if (!gl) return;

  setupInteraction(canvas, gl);

  // 🔁 Update rendering saat layar di-resize
  window.addEventListener('resize', () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;

      gl.viewport(0, 0, canvas.width, canvas.height);
      renderCube(gl);
    }
  });

  function renderLoop() {
    renderCube(gl);
    requestAnimationFrame(renderLoop);
  }

  renderLoop();
});