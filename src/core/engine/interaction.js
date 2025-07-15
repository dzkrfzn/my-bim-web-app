import { state } from "./state.js";
import { renderCube } from "./renderer.js";

let isPanDragging = false;
let isOrbitDragging = false;

let lastX = 0,
  lastY = 0;

export function setupInteraction(canvas, gl) {
  // ===== MOUSE DOWN =====
  canvas.addEventListener("mousedown", (e) => {
    // PAN: Tombol scroll (button 1) tanpa Shift
    if (e.button === 1 && !e.shiftKey) {
      isPanDragging = true;
    }

    // ORBIT: Shift + klik scroll / klik kiri / klik kanan
    if (e.shiftKey && (e.button === 0 || e.button === 1 || e.button === 2)) {
      isOrbitDragging = true;
    }

    lastX = e.clientX;
    lastY = e.clientY;
  });

  // ===== MOUSE MOVE =====
  canvas.addEventListener("mousemove", (e) => {
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;

    // Orbit
    if (isOrbitDragging) {
      state.rotation.y -= dx * 0.5; // Arah X sudah benar
      state.rotation.x += dy * 0.5;
      renderCube(gl);
    }

    // Pan
    if (isPanDragging) {
      state.pan.x += dx * 0.01;
      state.pan.y -= dy * 0.01;

      state.viewMatrix[12] = state.pan.x;
      state.viewMatrix[13] = state.pan.y;

      renderCube(gl);
    }

    lastX = e.clientX;
    lastY = e.clientY;
  });

  // ===== MOUSE UP =====
  canvas.addEventListener("mouseup", (e) => {
    if (e.button === 1 && !e.shiftKey) {
      isPanDragging = false;
    }
    if ((e.button === 0 || e.button === 1 || e.button === 2) && e.shiftKey) {
      isOrbitDragging = false;
    }
  });

  canvas.addEventListener("mouseleave", () => {
    isPanDragging = false;
    isOrbitDragging = false;
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
    renderCube(gl);
  });
}
