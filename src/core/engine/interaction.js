import { state } from "./state.js";
import { renderCube } from "./renderer.js";

let isOrbitDragging = false;
let isPanDragging = false;

let lastX = 0,
  lastY = 0;

export function setupInteraction(canvas, gl) {
  // Cegah menu konteks saat klik kanan
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  canvas.addEventListener("mousedown", (e) => {
    // ===== PAN via Scroll Click (tombol tengah) =====
    if (e.button === 1 && !e.shiftKey) {
      console.log("✋ Pan dimulai (Scroll Click)");
      isPanDragging = true;
      e.preventDefault();
    }

    // ===== ORBIT via Shift + Klik Kanan =====
    if (e.shiftKey && e.button === 2) {
      console.log("🌀 Orbit dimulai (Shift + Klik Kanan)");
      isOrbitDragging = true;
      e.preventDefault();
    }

    // ===== ORBIT via Shift + Scroll Click =====
    if (e.shiftKey && e.button === 1) {
      console.log("🌀 Orbit dimulai (Shift + Scroll Click)");
      isOrbitDragging = true;
      e.preventDefault();
    }

    lastX = e.clientX;
    lastY = e.clientY;
  });

  canvas.addEventListener("mousemove", (e) => {
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;

    // ===== ORBIT =====
    if (isOrbitDragging) {
      // Arah horizontal (X) benar
      state.rotation.y -= dx * 0.5;

      // 🔧 Perbaikan arah vertikal (Y): gunakan -dy
      state.rotation.x -= dy * 0.5;

      renderCube(gl);
    }

    // ===== PAN =====
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

  canvas.addEventListener("mouseup", (e) => {
    if (
      (e.shiftKey && (e.button === 1 || e.button === 2)) ||
      (!e.shiftKey && e.button === 1)
    ) {
      isOrbitDragging = false;
      isPanDragging = false;
    }
  });

  canvas.addEventListener("mouseleave", () => {
    isOrbitDragging = false;
    isPanDragging = false;
  });

  // Zoom via scroll
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
