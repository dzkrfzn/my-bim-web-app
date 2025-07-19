// src/core/engine/renderer.js

import { mat4 } from "../lib/gl-matrix-module.js";

export class Renderer {
  constructor(gl) {
    this.gl = gl;

    this.program = this.createProgram();
    this.positionAttributeLocation = gl.getAttribLocation(
      this.program,
      "a_position"
    );
    this.matrixUniformLocation = gl.getUniformLocation(
      this.program,
      "u_matrix"
    );

    this.projectionMatrix = mat4.create();
    this.viewMatrix = mat4.create();
    this.modelMatrix = mat4.create();
    this.mvpMatrix = mat4.create();

    this.initMatrices();
  }

  createProgram() {
    const gl = this.gl;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(
      vertexShader,
      `
            attribute vec3 a_position;
            uniform mat4 u_matrix;
            void main() {
                gl_Position = u_matrix * vec4(a_position, 1.0);
            }
        `
    );
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error("Vertex shader error:", gl.getShaderInfoLog(vertexShader));
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(
      fragmentShader,
      `
            precision mediump float;
            void main() {
                gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
            }
        `
    );
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error(
        "Fragment shader error:",
        gl.getShaderInfoLog(fragmentShader)
      );
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
    }

    return program;
  }

  initMatrices() {
    const gl = this.gl;
    const canvas = gl.canvas;

    mat4.perspective(
      this.projectionMatrix,
      Math.PI / 4,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      100
    );

    mat4.lookAt(this.viewMatrix, [0, 0, 5], [0, 0, 0], [0, 1, 0]);
    mat4.identity(this.modelMatrix);
  }

  updateMVP() {
    mat4.multiply(this.mvpMatrix, this.viewMatrix, this.modelMatrix);
    mat4.multiply(this.mvpMatrix, this.projectionMatrix, this.mvpMatrix);
  }

  render(vertices, indices) {
    const gl = this.gl;

    // Aktifkan program shader
    gl.useProgram(this.program);

    // Buat buffer vertex
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Aktifkan atribut posisi
    gl.enableVertexAttribArray(this.positionAttributeLocation);
    gl.vertexAttribPointer(
      this.positionAttributeLocation,
      3,
      gl.FLOAT,
      false,
      0,
      0
    );

    // Buat buffer index
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // Kirim matriks ke shader
    gl.uniformMatrix4fv(this.matrixUniformLocation, false, this.mvpMatrix);

    // Gambar model
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  }
}
