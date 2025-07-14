import { rotateXMatrix, multiplyMatrices } from './utils.js';
import { state } from './state.js';
import { renderCube } from './renderer.js';

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
}

function renderScene(gl) {
  state.modelMatrix = rotateXMatrix(rotationX);
  renderCube(gl);
}