import { state } from "./state.js";
import { multiplyMatrices, perspectiveMatrix, lookAt } from "./utils.js";

export function initWebGL(canvas) {
  const devicePixelRatio = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;

  const gl = canvas.getContext("webgl", {
    antialias: true,
    preserveDrawingBuffer: true,
  });

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.1, 0.1, 0.1, 1.0);
  gl.enable(gl.DEPTH_TEST);

  return gl;
}

export function renderCube(gl) {
  const vertices = new Float32Array([
    -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,

    -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5,
  ]);

  const indices = new Uint16Array([
    0, 1, 2, 0, 2, 3, 1, 5, 6, 1, 6, 2, 5, 4, 7, 5, 7, 6, 4, 0, 3, 4, 3, 7, 3,
    2, 6, 3, 6, 7, 4, 5, 1, 4, 1, 0,
  ]);

  // Setup shader & buffer seperti sebelumnya...

  const aspect = gl.canvas.width / gl.canvas.height;
  const projectionMatrix = perspectiveMatrix(45, aspect, 0.1, 100);

  const radius = state.distance;
  const theta = state.theta;
  const phi = state.phi;

  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  const eye = [x + state.target[0], y + state.target[1], z + state.target[2]];
  const center = [...state.target];
  const up = [0, 1, 0];

  const viewMatrix = lookAt(eye, center, up);

  const uMatrix = gl.getUniformLocation(gl.program, "uMatrix");
  const viewProj = multiplyMatrices(projectionMatrix, viewMatrix);

  gl.uniformMatrix4fv(uMatrix, false, new Float32Array(viewProj));

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}
