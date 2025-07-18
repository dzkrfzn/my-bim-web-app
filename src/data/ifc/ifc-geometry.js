// src/data/ifc/ifc-geometry.js

export class IFCGeometry {
  constructor(parser) {
    this.parser = parser;
    this.vertices = [];
    this.indices = [];
  }

  extractGeometry() {
    const pointMap = new Map(); // { id: index }

    // Simpan semua titik
    for (const [id, entity] of this.parser.entities) {
      if (entity.type === "IFCCARTESIANPOINT") {
        const coords = entity.args.map(Number);
        const index = this.vertices.length / 3;
        this.vertices.push(...coords);
        pointMap.set(id, index);
      }
    }

    // Contoh sederhana: ekstrak IFCPOLYLOOP
    for (const [id, entity] of this.parser.entities) {
      if (entity.type === "IFCPOLYLOOP") {
        const points = entity.args.map((id) =>
          pointMap.get(id.replace(/^#/, ""))
        );
        for (let i = 1; i < points.length - 1; i++) {
          this.indices.push(points[0], points[i], points[i + 1]);
        }
      }
    }

    return {
      vertices: new Float32Array(this.vertices),
      indices: new Uint16Array(this.indices),
    };
  }
}
