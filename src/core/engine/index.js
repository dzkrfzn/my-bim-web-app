import { initWebGL } from "./renderer.js";
import { setupInteraction } from "./interaction.js";
import { renderCube } from "./renderer.js";

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("webgl-canvas");
  const gl = initWebGL(canvas);
  if (!gl) return;

  setupInteraction(canvas, gl);

  // Auto resize
  window.addEventListener("resize", () => {
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;

    gl.viewport(0, 0, canvas.width, canvas.height);
    renderCube(gl);
  });

  // Render loop
  function renderLoop() {
    renderCube(gl);
    requestAnimationFrame(renderLoop);
  }

  renderLoop();
});
