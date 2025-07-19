// src/data/ifc/schemas/ifc2x3/geometry.js

export class IFC2X3Geometry {
  constructor(parser) {
    this.parser = parser;
    this.vertices = [];
    this.indices = [];
    this.pointMap = new Map();
  }

  extractGeometry() {
    this._parsePoints();
    this._parsePolylines();
    this._parseExtrusions();

    const hasGeometry = this.vertices.length > 0 && this.indices.length > 0;
    if (!hasGeometry) {
      console.warn("IFC2X3: Tidak ada geometri yang dapat dirender.");
    } else {
      console.log("IFC2X3: Geometri berhasil diekstraksi.");
    }

    return {
      vertices: new Float32Array(this.vertices),
      indices: new Uint16Array(this.indices),
    };
  }

  _parsePoints() {
    for (const [id, entity] of this.parser.entities) {
      if (entity.type.startsWith("IFCCARTESIANPOINT")) {
        const coords = entity.args.map(Number);
        const index = this.vertices.length / 3;
        this.vertices.push(...coords);
        this.pointMap.set(id, index);
      }
    }
    console.log("IFC2X3: Jumlah titik:", this.pointMap.size);
  }

  _parsePolylines() {
    for (const [id, entity] of this.parser.entities) {
      if (entity.type.startsWith("IFCPOLYLINE")) {
        const points = entity.args.map((arg) => arg.replace(/^#/, ""));
        for (let i = 1; i < points.length - 1; i++) {
          const p0 = this.pointMap.get(points[0]);
          const p1 = this.pointMap.get(points[i]);
          const p2 = this.pointMap.get(points[i + 1]);
          if (p0 !== undefined && p1 !== undefined && p2 !== undefined) {
            this.indices.push(p0, p1, p2);
          }
        }
      }
    }
  }

  _parseExtrusions() {
    for (const [id, entity] of this.parser.entities) {
      if (entity.type.startsWith("IFCEXTRUDEDAREASOLID")) {
        const profileId = entity.args[0]?.replace(/^#/, "");
        const directionId = entity.args[2]?.replace(/^#/, "");
        const length = parseFloat(entity.args[3]);
        if (profileId && this.pointMap.has(profileId)) {
          const index = this.pointMap.get(profileId);
          this.vertices[index + 2] += length;
        }
      }
    }
  }
}
