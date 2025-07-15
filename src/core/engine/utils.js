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
 * Fungsi lookAt untuk navigasi orbit
 */
export function lookAt(eye, center, up) {
  const zAxis = normalize([
    eye[0] - center[0],
    eye[1] - center[1],
    eye[2] - center[2],
  ]);

  const upNorm = normalize(up);

  const xAxis = normalize(cross(upNorm, zAxis));
  const yAxis = cross(zAxis, xAxis);

  const rotation = [
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
    0,
    0,
    0,
    1,
  ];

  const translation = [
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    -eye[0],
    -eye[1],
    -eye[2],
    1,
  ];

  return multiplyMatrices(rotation, translation);
}

function normalize(v) {
  const len = Math.hypot(...v);
  return v.map((x) => x / len);
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}
