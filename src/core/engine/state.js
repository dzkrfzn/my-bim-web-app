// src/core/engine/state.js

export const state = {
  // Kamera
  target: [0, 0, 0], // Titik fokus
  distance: 5, // Jarak dari kamera ke target
  theta: 0, // Sudut horizontal
  phi: Math.PI / 2.5, // Sudut vertikal
  minDistance: 1,
  maxDistance: 20,

  // UI State
  isOrbitDragging: false, // Shift + Middle Click
  isAltOrbitDragging: false, // Right Click + drag
  isPanDragging: false, // Middle Click
  lastX: 0,
  lastY: 0,
};
