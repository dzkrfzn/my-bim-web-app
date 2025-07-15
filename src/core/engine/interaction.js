import { state } from "./state.js";
import { renderCube } from "./renderer.js";

export function setupInteraction(canvas, gl) {
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  // --- Scroll Roda: Zoom ---
  canvas.addEventListener("wheel", (e) => {
    const delta = Math.sign(e.deltaY);
    state.distance -= delta * 0.2;
    state.distance = Math.max(
      state.minDistance,
      Math.min(state.distance, state.maxDistance)
    );
    renderCube(gl);
  });

  // --- Middle Click: Pan ---
  canvas.addEventListener("mousedown", (e) => {
    if (e.button === 1 && !e.shiftKey) {
      state.isPanDragging = true;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
    }
  });

  // --- Shift + Middle Click: Orbit ---
  canvas.addEventListener("mousedown", (e) => {
    if (e.shiftKey && e.button === 1) {
      state.isOrbitDragging = true;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
    }
  });

  // --- Klik Kanan dan tahan: Orbit Alternatif ---
  canvas.addEventListener("mousedown", (e) => {
    if (e.button === 2) {
      state.isAltOrbitDragging = true;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
    }
  });

  // --- Mouse Move Handler ---
  canvas.addEventListener("mousemove", (e) => {
    const dx = e.clientX - state.lastX;
    const dy = e.clientY - state.lastY;

    // Pan
    if (state.isPanDragging) {
      const speed = 0.005 * state.distance;
      state.target[0] += dx * -speed;
      state.target[1] += dy * -speed;
      renderCube(gl);
    }

    // Orbit (Shift + Middle Click)
    if (state.isOrbitDragging || state.isAltOrbitDragging) {
      state.theta -= dx * 0.005;
      state.phi += dy * 0.005;
      state.phi = Math.max(0.01, Math.min(Math.PI - 0.01, state.phi));
      renderCube(gl);
    }

    state.lastX = e.clientX;
    state.lastY = e.clientY;
  });

  // --- Mouse Up ---
  canvas.addEventListener("mouseup", (e) => {
    if (e.button === 1) {
      state.isPanDragging = false;
      state.isOrbitDragging = false;
    }
    if (e.button === 2) {
      state.isAltOrbitDragging = false;
    }
  });

  canvas.addEventListener("mouseleave", () => {
    state.isPanDragging = false;
    state.isOrbitDragging = false;
    state.isAltOrbitDragging = false;
  });
}
