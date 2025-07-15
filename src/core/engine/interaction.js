import { state } from "./state.js";
import { renderCube } from "./renderer.js";

let isPanDragging = false;
let isOrbitDragging = false;

let lastX = 0,
  lastY = 0;

export function setupInteraction(canvas, gl) {
  // Cegah menu konteks saat klik kanan
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  // ===== DEBUGGING: Log mousedown =====
  canvas.addEventListener("mousedown", (e) => {
    console.groupCollapsed("🖱️ Mouse Down");
    console.log("Button:", e.button); // 0 = kiri, 1 = tengah, 2 = kanan
    console.log("Shift Key:", e.shiftKey);
    console.groupEnd();

    // ===== ORBIT =====
    if (e.shiftKey && (e.button === 0 || e.button === 1 || e.button === 2)) {
      console.log("🌀 Orbit dimulai (Shift + klik)");
      isOrbitDragging = true;
      e.preventDefault();
    }

    // ===== PAN via Scroll Click (tombol tengah) =====
    if (e.button === 1 && !e.shiftKey) {
      console.log("✋ Pan dimulai (Scroll Click)");
      isPanDragging = true;
      e.preventDefault();
    }

    // ===== PAN via Shift + Klik Kiri =====
    if (e.shiftKey && e.button === 0 && !isOrbitDragging) {
      console.log("✋ Pan dimulai (Shift + Klik Kiri)");
      isPanDragging = true;
      e.preventDefault();
    }

    lastX = e.clientX;
    lastY = e.clientY;
  });

  // ===== MOUSEMOVE =====
  canvas.addEventListener("mousemove", (e) => {
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;

    // ===== DEBUGGING =====
    console.groupCollapsed("🖱️ Mouse Move");
    console.log("Delta X:", dx);
    console.log("Delta Y:", dy);
    console.log("Is Orbit Dragging:", isOrbitDragging);
    console.log("Is Pan Dragging:", isPanDragging);
    console.groupEnd();

    // ===== ORBIT =====
    if (isOrbitDragging) {
      state.rotation.y -= dx * 0.5; // Arah horizontal benar
      state.rotation.x += dy * 0.5;
      renderCube(gl);
    }

    // ===== PAN =====
    if (isPanDragging) {
      state.pan.x += dx * 0.01;
      state.pan.y -= dy * 0.01;

      state.viewMatrix[12] = state.pan.x;
      state.viewMatrix[13] = state.pan.y;

      // ⬇️ PENTING: Panggil renderCube(gl) agar perubahan langsung terlihat
      renderCube(gl); // <== INI YANG SEBELUMNYA HILANG
    }

    lastX = e.clientX;
    lastY = e.clientY;
  });

  // ===== MOUSEUP =====
  canvas.addEventListener("mouseup", (e) => {
    console.groupCollapsed("🖱️ Mouse Up");
    console.log("Button:", e.button);
    console.log("Shift Key:", e.shiftKey);
    console.groupEnd();

    if (
      (e.shiftKey && (e.button === 0 || e.button === 1 || e.button === 2)) ||
      (!e.shiftKey && e.button === 1)
    ) {
      isOrbitDragging = false;
      isPanDragging = false;
    }
  });

  canvas.addEventListener("mouseleave", () => {
    console.log("🚪 Mouse Leave: Reset semua interaksi.");
    isPanDragging = false;
    isOrbitDragging = false;
  });

  // ===== SCROLL ZOOM =====
  canvas.addEventListener("wheel", (e) => {
    const delta = Math.sign(e.deltaY);
    const zoomSpeed = 0.25;
    const minZoom = -8;
    const maxZoom = -2;

    state.zoom -= delta * zoomSpeed;
    state.zoom = Math.max(Math.min(state.zoom, maxZoom), minZoom);

    state.viewMatrix[14] = state.zoom;
    renderCube(gl);

    console.groupCollapsed("🔍 Zoom Event");
    console.log("Delta:", delta);
    console.log("Zoom Level:", state.zoom);
    console.groupEnd();
  });
}
