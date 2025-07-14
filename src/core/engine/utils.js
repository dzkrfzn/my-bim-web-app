// File: `/src/core/engine/utils.js`
export function createIdentityMatrix() {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ];
}

export function translateMatrix(matrix, tx, ty, tz) {
    const translation = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        tx, ty, tz, 1,
    ];
    return multiplyMatrices(matrix, translation);
}

export function rotateXMatrix(matrix, angle) {
    const rad = angle * Math.PI / 180;
    const rotation = [
        1, 0, 0, 0,
        0, Math.cos(rad), -Math.sin(rad), 0,
        0, Math.sin(rad), Math.cos(rad), 0,
        0, 0, 0, 1,
    ];
    return multiplyMatrices(matrix, rotation);
}

function multiplyMatrices(a, b) {
    // Implementasi perkalian matrix 4x4
}