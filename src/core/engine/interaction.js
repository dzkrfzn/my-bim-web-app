import { state } from './state.js';
import { renderCube } from './renderer.js';

let isRotateDragging = false;
let isPanDragging = false;
let lastX = 0, lastY = 0;

export function setupInteraction(canvas, gl) {
  // Rotasi: klik kiri + drag
  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) { // Klik kiri
      isRotateDragging = true;
    }
    lastX = e.clientX;
    lastY = e.clientY;
  });

  // Pan: Shift + klik kiri / klik tengah + drag
  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      isPanDragging = true;
    }
    lastX = e.clientX;
    lastY = e.clientY;
  });

  canvas.addEventListener('mousemove', (e) => {
    if (isRotateDragging) {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;

      state.rotation.y += dx * 0.5;
      state.rotation.x += dy * 0.5;

      renderCube(gl);
    }

    if (isPanDragging) {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;

      // Update translasi di view matrix
      state.pan.x += dx * 0.01;
      state.pan.y -= dy * 0.01;

      // Perbarui view matrix
      state.viewMatrix[12] = state.pan.x;
      state.viewMatrix[13] = state.pan.y;

      renderCube(gl);
    }

    lastX = e.clientX;
    lastY = e.clientY;
  });

  canvas.addEventListener('mouseup', (e) => {
    if (e.button === 0) isRotateDragging = false;
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) isPanDragging = false;
  });

  canvas.addEventListener('mouseleave', () => {
    isRotateDragging = false;
    isPanDragging = false;
  });

  // Zoom via scroll
  canvas.addEventListener('wheel', (e) => {
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