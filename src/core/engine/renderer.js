// Inisialisasi WebGL
export function initWebGL(canvas) {
    const gl = canvas.getContext('webgl');
    if (!gl) {
        console.error("WebGL tidak didukung.");
        return null;
    }

    // Atur ukuran viewport
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Warna background
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    return gl;
}

// Render kubus
export function renderCube(gl) {
    const vertices = [
        // Depan
        -0.5, -0.5,  0.5,  0.5, -0.5,  0.5,  0.5,  0.5,  0.5, -0.5,  0.5,  0.5,
        // Belakang
        -0.5, -0.5, -0.5,  0.5, -0.5, -0.5,  0.5,  0.5, -0.5, -0.5,  0.5, -0.5,
        // ... (tambahkan sisi lainnya)
    ];

    const indices = [
        0, 1, 2, 0, 2, 3, // Depan
        4, 5, 6, 4, 6, 7, // Belakang
        // ... (tambahkan sisi lainnya)
    ];

    // Buat buffer
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // Vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, `
        attribute vec3 aPosition;
        void main() {
            gl_Position = vec4(aPosition, 1.0);
        }
    `);
    gl.compileShader(vertexShader);

    // Fragment shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, `
        void main() {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Warna merah
        }
    `);
    gl.compileShader(fragmentShader);

    // Program shader
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Bind atribut
    const positionAttrib = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(positionAttrib);
    gl.vertexAttribPointer(positionAttrib, 3, gl.FLOAT, false, 0, 0);

    // Gambar objek
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}