import { multiplyMatrices, perspectiveMatrix, rotateXMatrix } from './utils.js';

export let projectionMatrix = [];
export let viewMatrix = createIdentityMatrix();
export let modelMatrix = createIdentityMatrix();

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
  const vertices = [
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
  ];

  const indices = [
    0, 1, 2, 0, 2, 3, // Depan
    1, 5, 6, 1, 6, 2, // Kanan
    5, 4, 7, 5, 7, 6, // Belakang
    4, 0, 3, 4, 3, 7, // Kiri
    3, 2, 6, 3, 6, 7, // Atas
    4, 5, 1, 4, 1, 0, // Bawah
  ];

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  const vsSource = `
    attribute vec3 aPosition;
    uniform mat4 uMatrix;
    void main() {
      gl_Position = uMatrix * vec4(aPosition, 1.0);
    }
  `;

  const fsSource = `
    void main() {
      gl_FragColor = vec4(0.2, 0.6, 1.0, 1.0); // Biru terang
    }
  `;

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vsSource);
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error("Vertex shader error:", gl.getShaderInfoLog(vertexShader));
  }

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fsSource);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error("Fragment shader error:", gl.getShaderInfoLog(fragmentShader));
  }

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
  }

  gl.useProgram(program);

  const positionAttrib = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(positionAttrib);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(positionAttrib, 3, gl.FLOAT, false, 0, 0);

  const uMatrix = gl.getUniformLocation(program, "uMatrix");

  // Update camera
  const aspect = gl.canvas.width / gl.canvas.height;
  projectionMatrix = perspectiveMatrix(45, aspect, 0.1, 100);
  const cameraZ = 3;

  // Gabungkan matrix
  let mv = multiplyMatrices(viewMatrix, modelMatrix);
  let mvp = multiplyMatrices(projectionMatrix, mv);

  gl.uniformMatrix4fv(uMatrix, false, new Float32Array(mvp));

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}