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
  // Verteks kubus (koordinat 3D)
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

  // Indeks segitiga
  const indices = new Uint16Array([
    0, 1, 2, 0, 2, 3, // Depan
    1, 5, 6, 1, 6, 2, // Kanan
    5, 4, 7, 5, 7, 6, // Belakang
    4, 0, 3, 4, 3, 7, // Kiri
    3, 2, 6, 3, 6, 7, // Atas
    4, 5, 1, 4, 1, 0, // Bawah
  ]);

  // Buat buffer vertex
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  // Buat buffer index
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  // Vertex Shader
  const vsSource = `
    attribute vec3 aPosition;
    uniform mat4 uMatrix;
    void main() {
      gl_Position = uMatrix * vec4(aPosition, 1.0);
    }
  `;

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vsSource);
  gl.compileShader(vertexShader);

  // Validasi kompilasi vertex shader
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error("Vertex shader gagal dikompilasi:", gl.getShaderInfoLog(vertexShader));
    gl.deleteShader(vertexShader);
    return null;
  }

  // Fragment Shader
  const fsSource = `
    void main() {
      gl_FragColor = vec4(0.2, 0.6, 1.0, 1.0); // Biru terang
    }
  `;

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fsSource);
  gl.compileShader(fragmentShader);

  // Validasi kompilasi fragment shader
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error("Fragment shader gagal dikompilasi:", gl.getShaderInfoLog(fragmentShader));
    gl.deleteShader(fragmentShader);
    return null;
  }

  // Link program
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  // Validasi link program
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program gagal dilink:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  gl.useProgram(program);

  // Atribut posisi
  const positionAttrib = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(positionAttrib);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(positionAttrib, 3, gl.FLOAT, false, 0, 0);

  // Uniform matrix
  const uMatrix = gl.getUniformLocation(program, "uMatrix");

  // Update camera
  const aspect = gl.canvas.width / gl.canvas.height;
  projectionMatrix = perspectiveMatrix(45, aspect, 0.1, 100);

  // Gabungkan matriks ModelViewProjection
  let mv = multiplyMatrices(viewMatrix, modelMatrix);
  let mvp = multiplyMatrices(projectionMatrix, mv);

  // Kirim ke shader
  gl.uniformMatrix4fv(uMatrix, false, new Float32Array(mvp));

  // Render
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}