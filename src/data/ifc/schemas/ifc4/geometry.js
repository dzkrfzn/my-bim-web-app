// src/data/ifc/schemas/ifc4/geometry.js

export class IFC4Geometry {
  constructor(parser) {
    this.parser = parser;
    this.vertices = [];
    this.indices = [];
    this.pointMap = new Map(); // { id: index }
    this.faceSetMap = new Map(); // { id: indices }
    this.extrusionMap = new Map(); // { id: indices }
    this.mappedItemMap = new Map(); // { id: indices }
    this.placementMap = new Map(); // { id: matrix }
  }

  extractGeometry(data) {
    this._parsePoints();
    this._parseTriangulatedFaceSet();
    this._parseIndexedPolygonalFaceSet();
    this._parseExtrudedAreaSolid();
    this._parseMappedItem();
    this._parseLocalPlacement();

    const hasGeometry = this.vertices.length > 0 && this.indices.length > 0;
    if (!hasGeometry) {
      console.warn("IFC4: Tidak ada geometri yang dapat dirender.");
    } else {
      console.log("IFC4: Geometri berhasil diekstraksi.");
    }

    return {
      vertices: new Float32Array(this.vertices),
      indices: new Uint16Array(this.indices),
    };
  }

  _parsePoints() {
    for (const [id, entity] of this.parser.entities) {
      if (entity.type === "IFCCARTESIANPOINT") {
        const coordsStr = entity.args[0]?.replace(/^\(|$\s*$/g, "");
        if (!coordsStr) {
          console.warn(
            "IFCCARTESIANPOINT: Format koordinat tidak valid untuk ID:",
            id
          );
          continue;
        }

        const coords = coordsStr.split(",").map(Number);
        const index = this.vertices.length / 3;

        this.vertices.push(...coords);
        this.pointMap.set(id, index);
      }
    }
    console.log("IFC4: Jumlah titik:", this.pointMap.size);
  }

  _parseTriangulatedFaceSet() {
    for (const [id, entity] of this.parser.entities) {
      if (entity.type === "IFCTRIANGULATEDFACESET") {
        const coordsStr = entity.args[0]?.replace(/^\(|$\s*$/g, "");
        const pointsStr = entity.args[1]?.replace(/^\(|$\s*$/g, "");

        if (!coordsStr || !pointsStr) continue;

        const coords = coordsStr.split(",").map(Number);
        const points = pointsStr
          .split(",")
          .map((coord) => coord.replace(/^#/, ""));

        const indices = [];
        for (let i = 0; i < points.length; i++) {
          const pid = points[i];
          const idx = this.pointMap.get(pid);
          if (idx !== undefined) {
            indices.push(idx);
          }
        }

        if (indices.length > 0) {
          this.faceSetMap.set(id, indices);
          this.indices.push(...indices);
        }
      }
    }
    console.log("IFC4: Jumlah triangulated face set:", this.faceSetMap.size);
  }

  _parseIndexedPolygonalFaceSet() {
    for (const [id, entity] of this.parser.entities) {
      if (entity.type === "IFCINDEXEDPOLYGONALFACESET") {
        const coordsStr = entity.args[2]?.replace(/^\(|$\s*$/g, "");
        if (!coordsStr) continue;

        const coords = coordsStr
          .split(",")
          .map((coord) => coord.replace(/^#/, ""));
        const indices = [];

        for (let i = 0; i < coords.length; i++) {
          const pid = coords[i];
          const idx = this.pointMap.get(pid);
          if (idx !== undefined) {
            indices.push(idx);
          }
        }

        if (indices.length > 0) {
          this.faceSetMap.set(id, indices);
          this.indices.push(...indices);
        }
      }
    }
    console.log("IFC4: Jumlah face set:", this.faceSetMap.size);
  }

  _parseExtrudedAreaSolid() {
    for (const [id, entity] of this.parser.entities) {
      if (entity.type === "IFCEXTRUDEDAREASOLID") {
        const profileId = entity.args[0]?.replace(/^#/, "");
        if (profileId && this.faceSetMap.has(profileId)) {
          const indices = this.faceSetMap.get(profileId);
          this.indices.push(...indices);
        }
      }
    }
  }

  _parseMappedItem() {
    for (const [id, entity] of this.parser.entities) {
      if (entity.type === "IFCMAPPEDITEM") {
        const mapId = entity.args[0]?.replace(/^#/, "");
        const placementId = entity.args[1]?.replace(/^#/, "");

        const map = this.parser.entities.get(mapId);
        if (map?.type === "IFCREPRESENTATIONMAP") {
          const shapeRepId = map.args[1]?.replace(/^#/, "");
          const shapeRep = this.parser.entities.get(shapeRepId);
          if (shapeRep && shapeRep.type === "IFCSHAPEREPRESENTATION") {
            const items = shapeRep.args[3]?.replace(/^$#/, "").split(",#");
            if (items) {
              items.forEach((itemId) => {
                const item = this.parser.entities.get(itemId);
                if (item && item.type === "IFCEXTRUDEDAREASOLID") {
                  this._parseExtrudedAreaSolidFromMappedItem(item);
                }
              });
            }
          }
        }
      }
    }
  }

  _parseExtrudedAreaSolidFromMappedItem(entity) {
    const profileId = entity.args[0]?.replace(/^#/, "");
    if (profileId && this.faceSetMap.has(profileId)) {
      const indices = this.faceSetMap.get(profileId);
      this.indices.push(...indices);
    }
  }

  _parseLocalPlacement() {
    for (const [id, entity] of this.parser.entities) {
      if (entity.type === "IFCLOCALPLACEMENT") {
        const placementId = entity.args[1]?.replace(/^#/, "");
        const placement = this.parser.entities.get(placementId);

        if (placement && placement.type === "IFCAXIS2PLACEMENT3D") {
          const locationId = placement.args[0]?.replace(/^#/, "");
          const zAxisId = placement.args[1]?.replace(/^#/, "");
          const xAxisId = placement.args[2]?.replace(/^#/, "");

          const location = this.pointMap.get(locationId);
          const zAxis = this.pointMap.get(zAxisId);
          const xAxis = this.pointMap.get(xAxisId);

          if (location !== undefined) {
            const offset = [
              this.vertices[location * 3],
              this.vertices[location * 3 + 1],
              this.vertices[location * 3 + 2],
            ];
            this._applyPlacement(offset);
          }
        }
      }
    }
  }

  _applyPlacement(offset) {
    // Tambahkan logika transformasi berdasarkan offset
    console.log("IFC4: Menerapkan transformasi ke", offset);
    // Di sini bisa tambahkan logika matriks menggunakan gl-matrix
  }
}
