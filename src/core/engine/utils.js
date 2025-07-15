// src/core/engine/utils.js

/**
 * Membuat matriks identitas 4x4
 */
export function createIdentityMatrix() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
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
    f / aspect,
    0,
    0,
    0,
    0,
    f,
    0,
    0,
    0,
    0,
    (far + near) / (near - far),
    -1,
    0,
    0,
    (2 * far * near) / (near - far),
    0,
  ];
}

/**
 * Matriks rotasi sumbu X
 */
export function rotateXMatrix(angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  const c = Math.cos(rad),
    s = Math.sin(rad);
  return [1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1];
}

/**
 * Matriks rotasi sumbu Y
 */
export function rotateYMatrix(angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  const c = Math.cos(rad),
    s = Math.sin(rad);
  return [c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1];
}

/**
 * Matriks rotasi sumbu Z
 */
export function rotateZMatrix(angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  const c = Math.cos(rad),
    s = Math.sin(rad);
  return [c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

/**
 * Membuat matriks lookAt (kamera)
 */
export function lookAt(eye, center, up) {
  const zAxis = normalizeVector([
    eye[0] - center[0],
    eye[1] - center[1],
    eye[2] - center[2],
  ]);
  if (zAxis.every((v) => v === 0)) return createIdentityMatrix();

  const xAxis = normalizeVector(crossProduct(up, zAxis));
  const yAxis = normalizeVector(crossProduct(zAxis, xAxis));

  const result = [
    xAxis[0],
    yAxis[0],
    zAxis[0],
    0,
    xAxis[1],
    yAxis[1],
    zAxis[1],
    0,
    xAxis[2],
    yAxis[2],
    zAxis[2],
    0,
    -dotProduct(xAxis, eye),
    -dotProduct(yAxis, eye),
    -dotProduct(zAxis, eye),
    1,
  ];

  return result;
}

// --- Fungsi utilitas tambahan ---

function normalizeVector(v) {
  const length = Math.hypot(...v);
  return v.map((n) => n / length);
}

function crossProduct(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function dotProduct(a, b) {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}
