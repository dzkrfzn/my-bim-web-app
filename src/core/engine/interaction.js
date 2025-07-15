import { state } from "./state.js";
import { renderCube } from "./renderer.js";

let isOrbitDragging = false;
let isPanDragging = false;

let lastX = 0,
  lastY = 0;
let needsRender = false;

export function setupInteraction(canvas, gl) {
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  // ===== MOUSE DOWN =====
  canvas.addEventListener("mousedown", (e) => {
    if (e.button === 1 && !e.shiftKey) {
      isPanDragging = true;
      e.preventDefault();
    }

    if ((e.shiftKey && e.button === 2) || (e.shiftKey && e.button === 1)) {
      isOrbitDragging = true;
      e.preventDefault();
    }

    lastX = e.clientX;
    lastY = e.clientY;
  });

  // ===== MOUSE MOVE =====
  canvas.addEventListener("mousemove", (e) => {
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;

    if (isOrbitDragging) {
      state.rotation.y -= dx * 0.5;
      state.rotation.x -= dy * 0.5;
      needsRender = true;
    }

    if (isPanDragging) {
      state.pan.x += dx * 0.01;
      state.pan.y -= dy * 0.01;
      needsRender = true;
    }

    lastX = e.clientX;
    lastY = e.clientY;
  });

  // ===== SCROLL ZOOM =====
  canvas.addEventListener("wheel", (e) => {
    const delta = Math.sign(e.deltaY);
    const zoomSpeed = 0.25;
    const minZoom = -8;
    const maxZoom = -2;

    state.zoom -= delta * zoomSpeed;
    state.zoom = Math.max(Math.min(state.zoom, maxZoom), minZoom);

    state.viewMatrix[14] = state.zoom;

    // ⬇️ Penting: Paksakan renderCube(gl) saat zoom
    renderCube(gl); // <== ✅ Panggil langsung agar zoom langsung terlihat
  });

  // ===== RENDER LOOP =====
  function renderLoop() {
    if (needsRender) {
      renderCube(gl);
      needsRender = false;
    }
    requestAnimationFrame(renderLoop);
  }

  renderLoop();

  // ===== MOUSE UP & LEAVE =====
  canvas.addEventListener("mouseup", () => {
    isOrbitDragging = false;
    isPanDragging = false;
  });

  canvas.addEventListener("mouseleave", () => {
    isOrbitDragging = false;
    isPanDragging = false;
  });
}
