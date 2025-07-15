// src/core/engine/interaction.js

import { state } from "./state.js";
import { renderCube } from "./renderer.js";

export function setupInteraction(canvas, gl) {
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  // --- Orbit dengan klik tengah ---
  canvas.addEventListener("mousedown", (e) => {
    if (e.button === 1) {
      state.isOrbitDragging = true;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
    }
  });

  // --- Pan dengan scroll click + shift ---
  canvas.addEventListener("mousedown", (e) => {
    if (e.shiftKey && e.button === 1) {
      state.isPanDragging = true;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
    }
  });

  // --- Zoom dengan wheel ---
  canvas.addEventListener("wheel", (e) => {
    const delta = Math.sign(e.deltaY);
    state.distance -= delta * 0.2;
    state.distance = Math.max(
      state.minDistance,
      Math.min(state.distance, state.maxDistance)
    );
    renderCube(gl);
  });

  // --- Mouse Move Handler ---
  canvas.addEventListener("mousemove", (e) => {
    if (state.isOrbitDragging) {
      const dx = e.clientX - state.lastX;
      const dy = e.clientY - state.lastY;

      state.theta -= dx * 0.01;
      state.phi += dy * 0.01;
      state.phi = Math.max(0.1, Math.min(Math.PI - 0.1, state.phi));

      renderCube(gl);
    }

    if (state.isPanDragging) {
      const dx = e.clientX - state.lastX;
      const dy = e.clientY - state.lastY;

      const speed = 0.005;
      state.target[0] += dx * speed * state.distance;
      state.target[1] -= dy * speed * state.distance;

      renderCube(gl);
    }

    state.lastX = e.clientX;
    state.lastY = e.clientY;
  });

  // --- Mouse Up ---
  canvas.addEventListener("mouseup", (e) => {
    if (e.button === 1) {
      state.isOrbitDragging = false;
      state.isPanDragging = false;
    }
  });

  canvas.addEventListener("mouseleave", () => {
    state.isOrbitDragging = false;
    state.isPanDragging = false;
  });
}
