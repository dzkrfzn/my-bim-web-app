// src/core/engine/state.js

export const state = {
  // Navigasi 3D
  target: [0, 0, 0], // Titik fokus (pusat orbit)
  distance: 5, // Jarak dari kamera ke target
  theta: 0, // Sudut horizontal
  phi: Math.PI / 2.5, // Sudut vertikal
  minDistance: 1,
  maxDistance: 20,

  // UI State
  isOrbitDragging: false,
  isPanDragging: false,
  isAltOrbitDragging: false, // Untuk kombinasi klik tengah + kanan
  lastX: 0,
  lastY: 0,
};
