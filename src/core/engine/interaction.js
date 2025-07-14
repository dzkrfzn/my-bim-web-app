// File: `/src/core/engine/interaction.js`
export function setupInteraction(canvas, gl, matrix) {
    let isDragging = false;
    let lastX = 0, lastY = 0;

    canvas.addEventListener('mousedown', (event) => {
        isDragging = true;
        lastX = event.clientX;
        lastY = event.clientY;
    });

    canvas.addEventListener('mousemove', (event) => {
        if (!isDragging) return;
        const deltaX = event.clientX - lastX;
        const deltaY = event.clientY - lastY;
        matrix = rotateXMatrix(matrix, deltaY * 0.5);
        lastX = event.clientX;
        lastY = event.clientY;
        renderCube(gl); // Re-render setelah perubahan
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
    });
}