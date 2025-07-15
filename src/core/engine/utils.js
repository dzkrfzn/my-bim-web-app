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
