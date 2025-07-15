import { state } from "./state.js";
import { renderCube } from "./renderer.js";

let isRotateDragging = false;
let isPanDragging = false;
let isOrbitDragging = false;

let lastX = 0,
  lastY = 0;

export function setupInteraction(canvas, gl) {
  // ===== ROTASI =====
  canvas.addEventListener("mousedown", (e) => {
    if (e.button === 1 && !e.shiftKey) {
      // Scroll click = pan
      isPanDragging = true;
    }

    if (e.button === 2 && e.shiftKey) {
      // Shift + klik kanan = orbit
      isOrbitDragging = true;
    }

    if (e.button === 0 && e.shiftKey) {
      // Shift + klik kiri = orbit
      isOrbitDragging = true;
    }

    lastX = e.clientX;
    lastY = e.clientY;
  });

  // ===== GERAKAN MOUSE =====
  canvas.addEventListener("mousemove", (e) => {
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;

    // Orbit
    if (isOrbitDragging) {
      state.rotation.y += dx * 0.5;
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

  // ===== LEPASKAN MOUSE =====
  canvas.addEventListener("mouseup", (e) => {
    if (e.button === 1 && isPanDragging) isPanDragging = false;
    if ((e.button === 2 || e.button === 0) && isOrbitDragging)
      isOrbitDragging = false;
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
