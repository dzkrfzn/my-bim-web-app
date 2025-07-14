// src/core/engine/interaction.js

import { rotateXMatrix, multiplyMatrices, perspectiveMatrix } from './utils.js';
import { renderCube } from './renderer.js'; // ⬅️ Penting! Tambahkan baris ini

let isDragging = false;
let lastX = 0, lastY = 0;
let rotationX = 0;

export function setupInteraction(canvas, gl) {
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;

    rotationX += dy * 0.5;

    lastX = e.clientX;
    lastY = e.clientY;
    renderScene(gl);
  });

  canvas.addEventListener('mouseup', () => {
    isDragging = false;
  });

  canvas.addEventListener('mouseleave', () => {
    isDragging = false;
  });

  canvas.addEventListener('wheel', (e) => {
    const scale = 0.95;
    const delta = e.deltaY * (e.deltaMode === WheelEvent.DOM_DELTA_LINE ? 10 : 1);
    const fov = 45 * (delta > 0 ? scale : 1 / scale);
    renderScene(gl);
  });
}

function renderScene(gl) {
  const modelRotX = rotateXMatrix(rotationX);
  window.modelMatrix = modelRotX; // ⚠️ Hanya untuk debugging — bisa dipindahkan nanti
  renderCube(gl); // ✅ Sekarang fungsi ini tersedia
}