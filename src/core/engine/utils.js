// src/core/engine/utils.js

/**
 * Membuat matriks identitas 4x4
 */
export function createIdentityMatrix() {
  return [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ];
}

/**
 * Mengalikan dua matriks 4x4
 */
export function multiplyMatrices(a, b) {
  const result = new Array(16).fill(0);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      for (let i = 0; i < 4; i++) {
        result[col * 4 + row] += a[i * 4 + row] * b[col * 4 + i];
      }
    }
  }
  return result;
}

/**
 * Membuat matriks proyeksi perspektif
 */
export function perspectiveMatrix(fov, aspect, near, far) {
  const f = 1.0 / Math.tan(fov / 2);
  return [
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) / (near - far), -1,
    0, 0, (2 * far * near) / (near - far), 0
  ];
}

/**
 * Membuat matriks rotasi di sumbu X
 */
export function rotateXMatrix(angleDeg) {
  const rad = angleDeg * Math.PI / 180;
  const c = Math.cos(rad), s = Math.sin(rad);
  return [
    1, 0, 0, 0,
    0, c, -s, 0,
    0, s, c, 0,
    0, 0, 0, 1
  ];
}