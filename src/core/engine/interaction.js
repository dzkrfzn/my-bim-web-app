// src/core/engine/interaction.js

import { mat4 } from "../../lib/gl-matrix-module.js";

/**
 * Class untuk menangani interaksi pengguna dengan kamera 3D
 */
export class Interaction {
  constructor(canvas, renderer) {
    this.canvas = canvas;
    this.renderer = renderer;

    this.isDragging = false;
    this.lastX = 0;
    this.lastY = 0;

    this.pitch = 0;
    this.yaw = 0;
    this.distance = 5;

    this.init();
  }

  init() {
    this.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
    this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.canvas.addEventListener("wheel", this.onWheel.bind(this));
  }

  onMouseDown(e) {
    // Shift + klik atau klik tengah untuk mulai dragging
    if (e.shiftKey || e.button === 1) {
      this.isDragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    }
  }

  onMouseUp(e) {
    this.isDragging = false;
  }

  onMouseMove(e) {
    if (this.isDragging) {
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;

      this.yaw += dx * 0.01;
      this.pitch += dy * 0.01;

      // Batasi pitch agar kamera tidak terbalik
      this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));

      this.lastX = e.clientX;
      this.lastY = e.clientY;

      this.updateCamera();
    }
  }

  onWheel(e) {
    // Zoom menggunakan scroll
    this.distance *= e.deltaY < 0 ? 0.9 : 1.1;
    this.updateCamera();
  }

  updateCamera() {
    const { pitch, yaw, distance } = this;

    // Hitung posisi kamera berdasarkan yaw dan pitch
    const eye = [
      distance * Math.cos(pitch) * Math.sin(yaw),
      distance * Math.sin(pitch),
      distance * Math.cos(pitch) * Math.cos(yaw),
    ];

    // Update view matrix
    mat4.lookAt(this.renderer.viewMatrix, eye, [0, 0, 0], [0, 1, 0]);
    this.renderer.updateMVP();
  }
}
