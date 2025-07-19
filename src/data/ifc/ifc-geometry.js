// src/data/ifc/ifc-geometry.js

export class IFCGeometry {
  constructor(parser) {
    this.parser = parser;
    this.vertices = [];
    this.indices = [];
  }

  extractGeometry() {
    const pointMap = new Map();

    for (const [id, entity] of this.parser.entities) {
      if (entity.type === "IFCCARTESIANPOINT") {
        const coords = entity.args.map(Number);
        const index = this.vertices.length / 3;
        this.vertices.push(...coords);
        pointMap.set(id, index);
      }
    }

    for (const [id, entity] of this.parser.entities) {
      if (entity.type === "IFCPOLYLOOP") {
        const points = entity.args.map((arg) => arg.replace(/^#/, ""));
        for (let i = 1; i < points.length - 1; i++) {
          const p0 = pointMap.get(points[0]);
          const p1 = pointMap.get(points[i]);
          const p2 = pointMap.get(points[i + 1]);

          if (p0 !== undefined && p1 !== undefined && p2 !== undefined) {
            this.indices.push(p0, p1, p2);
          }
        }
      }
    }

    return {
      vertices: new Float32Array(this.vertices),
      indices: new Uint16Array(this.indices),
    };
  }
}
