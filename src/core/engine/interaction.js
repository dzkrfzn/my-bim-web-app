// src/core/engine/interaction.js

import { mat4 } from "../lib/gl-matrix-module.js";

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
      this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));

      this.lastX = e.clientX;
      this.lastY = e.clientY;

      this.updateCamera();
    }
  }

  onWheel(e) {
    this.distance *= e.deltaY < 0 ? 0.9 : 1.1;
    this.updateCamera();
  }

  updateCamera() {
    const eye = [
      this.distance * Math.cos(this.pitch) * Math.sin(this.yaw),
      this.distance * Math.sin(this.pitch),
      this.distance * Math.cos(this.pitch) * Math.cos(this.yaw),
    ];

    mat4.lookAt(this.renderer.viewMatrix, eye, [0, 0, 0], [0, 1, 0]);
    this.renderer.updateMVP();
  }

  fitToView(vertices) {
    if (!vertices || vertices.length < 3) return;

    let minX = Infinity,
      minY = Infinity,
      minZ = Infinity;
    let maxX = -Infinity,
      maxY = -Infinity,
      maxZ = -Infinity;

    for (let i = 0; i < vertices.length; i += 3) {
      minX = Math.min(minX, vertices[i]);
      minY = Math.min(minY, vertices[i + 1]);
      minZ = Math.min(minZ, vertices[i + 2]);
      maxX = Math.max(maxX, vertices[i]);
      maxY = Math.max(maxY, vertices[i + 1]);
      maxZ = Math.max(maxZ, vertices[i + 2]);
    }

    const center = [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2];

    const size = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
    this.distance = size * 2;

    this.yaw = 0;
    this.pitch = 0;

    this.updateCamera();
  }
}
