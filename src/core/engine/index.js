import { initWebGL } from "./renderer.js";
import { setupInteraction } from "./interaction.js";
import { renderCube } from "./renderer.js";

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("webgl-canvas");
  const gl = initWebGL(canvas);
  if (!gl) return;

  setupInteraction(canvas, gl);

  function renderLoop() {
    renderCube(gl);
    requestAnimationFrame(renderLoop);
  }

  renderLoop();

  window.addEventListener("resize", () => {
    const dpr = window.devicePixelRatio;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
    renderCube(gl);
  });
});
