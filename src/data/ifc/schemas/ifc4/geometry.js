// src/data/ifc/schemas/ifc4/geometry.js

export class IFC4Geometry {
  constructor(parser) {
    this.parser = parser;
    this.vertices = [];
    this.indices = [];
    this.pointMap = new Map(); // { id: index }
    this.faceSetMap = new Map(); // { id: indices }
  }

  extractGeometry() {
    this._parsePoints();
    this._parsePolygonalFaceSet();
    this._parseExtrudedAreaSolid();
    this._parseShapeRepresentation();
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
        const coords = entity.args.map(Number);
        const index = this.vertices.length / 3;
        this.vertices.push(...coords);
        this.pointMap.set(id, index);
      }
    }
    console.log("IFC4: Jumlah titik:", this.pointMap.size);
  }

  _parsePolygonalFaceSet() {
    for (const [id, entity] of this.parser.entities) {
      if (entity.type === "IFCINDEXEDPOLYGONALFACESET") {
        const points = entity.args[2]?.replace(/^$#/, "").split(",#");
        if (points) {
          const indices = [];
          for (let i = 0; i < points.length; i++) {
            const pid = points[i];
            const idx = this.pointMap.get(pid);
            if (idx !== undefined) {
              indices.push(idx);
            }
          }
          this.faceSetMap.set(id, indices);
        }
      }
    }
    console.log("IFC4: Jumlah face set:", this.faceSetMap.size);
  }

  _parseExtrudedAreaSolid() {
    for (const [id, entity] of this.parser.entities) {
      if (entity.type === "IFCEXTRUDEDAREASOLID") {
        const profileId = entity.args[0]?.replace(/^#/, "");
        const directionId = entity.args[2]?.replace(/^#/, "");
        const length = parseFloat(entity.args[3]);

        if (profileId && this.faceSetMap.has(profileId)) {
          const indices = this.faceSetMap.get(profileId);
          this.indices.push(...indices);
        }
      }
    }
  }

  _parseShapeRepresentation() {
    for (const [id, entity] of this.parser.entities) {
      if (entity.type === "IFCSHAPEREPRESENTATION") {
        const items = entity.args[3]?.replace(/^$#/, "").split(",#");
        if (items) {
          items.forEach((itemId) => {
            const item = this.parser.entities.get(itemId);
            if (item && item.type === "IFCEXTRUDEDAREASOLID") {
              console.log("IFC4: Menemukan ekstrusi:", itemId);
            }
          });
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
          const placement = this.parser.entities.get(placementId);
          console.log("IFC4: Menemukan pemetaan:", mapId);
        }
      }
    }
  }

  _parseMappedItem() {
    for (const [id, entity] of this.parser.entities) {
      if (entity.type.startsWith("IFCMAPPEDITEM")) {
        const mapId = entity.args[0]?.replace(/^#/, "");
        const placementId = entity.args[1]?.replace(/^#/, "");

        const map = this.parser.entities.get(mapId);
        if (map?.type === "IFCREPRESENTATIONMAP") {
          const placement = this.parser.entities.get(placementId);
          const shapeRepId = map.args[1]?.replace(/^#/, "");
          const shapeRep = this.parser.entities.get(shapeRepId);
          if (shapeRep && shapeRep.type === "IFCSHAPEREPRESENTATION") {
            const items = shapeRep.args[3]?.replace(/^$#/, "").split(",#");
            if (items) {
              items.forEach((itemId) => {
                const item = this.parser.entities.get(itemId);
                if (item && item.type === "IFCEXTRUDEDAREASOLID") {
                  this._parseExtrudedAreaSolidFromMappedItem(item, placement);
                }
              });
            }
          }
        }
      }
    }
  }

  _parseExtrudedAreaSolidFromMappedItem(entity, placement) {
    const profileId = entity.args[0]?.replace(/^#/, "");
    const directionId = entity.args[2]?.replace(/^#/, "");
    const length = parseFloat(entity.args[3]);

    if (profileId && this.faceSetMap.has(profileId)) {
      const indices = this.faceSetMap.get(profileId);
      this.indices.push(...indices);
    }
  }

  _parsePolygonalFaceSet() {
    for (const [id, entity] of this.parser.entities) {
      if (entity.type === "IFCINDEXEDPOLYGONALFACESET") {
        const coords = entity.args[2]?.replace(/^$#/, "").split(",#");
        if (coords) {
          const indices = [];
          for (let i = 0; i < coords.length; i++) {
            const pid = coords[i];
            const idx = this.pointMap.get(pid);
            if (idx !== undefined) {
              indices.push(idx);
            }
          }
          this.faceSetMap.set(id, indices);
        }
      }
    }
    console.log("IFC4: Jumlah face set:", this.faceSetMap.size);
  }

  _parseLocalPlacement() {
    for (const [id, entity] of this.parser.entities) {
      if (entity.type === "IFCLOCALPLACEMENT") {
        const relativeToId = entity.args[0]?.replace(/^#/, "");
        const placementId = entity.args[1]?.replace(/^#/, "");

        const placement = this.parser.entities.get(placementId);
        if (placement && placement.type === "IFCAXIS2PLACEMENT3D") {
          console.log("Menemukan IFCLOCALPLACEMENT:", id);
          // Di sini tambahkan logika transformasi matriks
        }
      }
    }
  }
}
