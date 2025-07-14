import { state } from './state.js';
import { renderCube } from './renderer.js';

let isDragging = false;
let lastX = 0, lastY = 0;

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

    state.rotation.y += dx * 0.5;
    state.rotation.x += dy * 0.5;

    lastX = e.clientX;
    lastY = e.clientY;
    renderCube(gl);
  });

  canvas.addEventListener('mouseup', () => {
    isDragging = false;
  });

  canvas.addEventListener('mouseleave', () => {
    isDragging = false;
  });

  canvas.addEventListener('wheel', (e) => {
    const delta = Math.sign(e.deltaY);
    state.zoom += delta * 0.5;
    state.viewMatrix[14] = state.zoom;
    renderCube(gl);
  });
}