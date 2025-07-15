// src/core/engine/state.js

import { createIdentityMatrix } from "./utils.js";

export const state = {
  // Kamera
  target: [0, 0, 0], // Titik fokus (pusat orbit)
  distance: 5, // Jarak dari kamera ke target
  theta: 0, // Sudut horizontal (azimuth)
  phi: Math.PI / 2.5, // Sudut vertikal (elevasi)
  minDistance: 1,
  maxDistance: 20,

  // UI State
  isOrbitDragging: false,
  isPanDragging: false,
  lastX: 0,
  lastY: 0,
};
