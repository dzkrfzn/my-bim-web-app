import { state } from './state.js';
import { multiplyMatrices, perspectiveMatrix } from './utils.js';

export function initWebGL(canvas) {
  const gl = canvas.getContext('webgl');
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
    // Depan
    -0.5, -0.5,  0.5,
     0.5, -0.5,  0.5,
     0.5,  0.5,  0.5,
    -0.5,  0.5,  0.5,

    // Belakang
    -0.5, -0.5, -0.5,
     0.5, -0.5, -0.5,
     0.5,  0.5, -0.5,
    -0.5,  0.5, -0.5,
  ]);

  const indices = new Uint16Array([
    0, 1, 2, 0, 2, 3, // Depan
    1, 5, 6, 1, 6, 2, // Kanan
    5, 4, 7, 5, 7, 6, // Belakang
    4, 0, 3, 4, 3, 7, // Kiri
    3, 2, 6, 3, 6, 7, // Atas
    4, 5, 1, 4, 1, 0, // Bawah
  ]);

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

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
  gl.useProgram(program);

  const positionAttrib = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(positionAttrib);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(positionAttrib, 3, gl.FLOAT, false, 0, 0);

  const uMatrix = gl.getUniformLocation(program, "uMatrix");

  const aspect = gl.canvas.width / gl.canvas.height;
  state.projectionMatrix = perspectiveMatrix(45, aspect, 0.1, 100);

  let rotX = rotateXMatrix(state.rotation.x);
  let rotY = rotateYMatrix(state.rotation.y);
  let rotZ = rotateZMatrix(state.rotation.z);

  let rotXY = multiplyMatrices(rotX, rotY);
  let rotXYZ = multiplyMatrices(rotXY, rotZ);

  state.modelMatrix = rotXYZ;

  let mv = multiplyMatrices(state.viewMatrix, state.modelMatrix);
  let mvp = multiplyMatrices(state.projectionMatrix, mv);

  gl.uniformMatrix4fv(uMatrix, false, new Float32Array(mvp));

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}