// Import fungsi dari modul renderer dan interaction
import { initWebGL, renderCube } from './renderer.js';
import { setupInteraction } from './interaction.js';

// Inisialisasi aplikasi
document.addEventListener('DOMContentLoaded', () => {
    // Dapatkan elemen canvas
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas) {
        console.error("Elemen canvas tidak ditemukan.");
        return;
    }

    // Inisialisasi WebGL
    const gl = initWebGL(canvas);
    if (!gl) {
        console.error("Gagal menginisialisasi WebGL.");
        return;
    }

    // Render kubus awal
    renderCube(gl);

    // Siapkan interaksi (rotasi)
    const initialMatrix = createIdentityMatrix();
    setupInteraction(canvas, gl, initialMatrix);
});

// Fungsi utilitas matrix (sederhana)
function createIdentityMatrix() {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ];
}