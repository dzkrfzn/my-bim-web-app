import { state } from "./state.js";
import { multiplyMatrices, perspectiveMatrix, lookAt } from "./utils.js";

export function initWebGL(canvas) {
  const devicePixelRatio = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;

  const gl = canvas.getContext("webgl");
  if (!gl) {
    console.error("WebGL tidak didukung.");
    return null;
  }

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

  // Setup shader dan buffer...

  const vsSource = `
    attribute vec3 aPosition;
    uniform mat4 uMatrix;
    void main() {
      gl_Position = uMatrix * vec4(aPosition, 1.0);
    }
  `;

  const fsSource = `
    void main() {
      gl_FragColor = vec4(1.0, 0.5, 0.0, 1.0); // Oranye
    }
  `;

  const program = gl.program || createAndLinkProgram(gl, vsSource, fsSource);
  gl.useProgram(program);

  const positionAttrib = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(positionAttrib);

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  gl.vertexAttribPointer(positionAttrib, 3, gl.FLOAT, false, 0, 0);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

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
  const viewProj = multiplyMatrices(projectionMatrix, viewMatrix);

  const uMatrix = gl.getUniformLocation(program, "uMatrix");
  gl.uniformMatrix4fv(uMatrix, false, new Float32Array(viewProj));

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

function createAndLinkProgram(gl, vsSource, fsSource) {
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vsSource);
  gl.compileShader(vertexShader);

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fsSource);
  gl.compileShader(fragmentShader);

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.program = program;

  return program;
}
