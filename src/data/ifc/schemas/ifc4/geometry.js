// src/data/ifc/schemas/ifc4/geometry.js

export class IFC4Geometry {
  constructor(parser) {
    this.parser = parser;
    this.vertices = [];
    this.indices = [];
    this.pointMap = new Map();
  }

  extractGeometry() {
    this._parsePoints();
    this._parseArbitraryClosedProfileDef();
    this._parseExtrudedAreaSolid();
    this._parseShapeRepresentation();
    this._parseMappedItem();

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
      if (entity.type.startsWith("IFCCARTESIANPOINT")) {
        const coords = entity.args.map(Number);
        const index = this.vertices.length / 3;
        this.vertices.push(...coords);
        this.pointMap.set(id, index);
      }
    }
    console.log("IFC4: Jumlah titik:", this.pointMap.size);
  }

  _parseArbitraryClosedProfileDef() {
    for (const [id, entity] of this.parser.entities) {
      if (entity.type.startsWith("IFCARBITRARYCLOSEDPROFILEDEF")) {
        const polylineId = entity.args[2]?.replace(/^#/, "");
        if (polylineId) {
          const polyline = this.parser.entities.get(polylineId);
          if (polyline && polyline.type === "IFCPOLYLINE") {
            this._parsePolyline(polyline, id);
          }
        }
      }
    }
  }

  _parsePolyline(polyline, parentId) {
    const points = polyline.args.map((arg) => arg.replace(/^#/, ""));
    const indices = [];

    for (let i = 1; i < points.length - 1; i++) {
      const p0 = this.pointMap.get(points[0]);
      const p1 = this.pointMap.get(points[i]);
      const p2 = this.pointMap.get(points[i + 1]);

      if (p0 !== undefined && p1 !== undefined && p2 !== undefined) {
        indices.push(p0, p1, p2);
      }
    }

    this._extrudedProfiles = this._extrudedProfiles || new Map();
    this._extrudedProfiles.set(parentId, indices);
  }

  _parseExtrudedAreaSolid() {
    this._extrudedProfiles = this._extrudedProfiles || new Map();
    for (const [id, entity] of this.parser.entities) {
      if (entity.type.startsWith("IFCEXTRUDEDAREASOLID")) {
        const profileId = entity.args[0]?.replace(/^#/, "");
        if (profileId && this._extrudedProfiles.has(profileId)) {
          const indices = this._extrudedProfiles.get(profileId);
          this.indices.push(...indices);
        }
      }
    }
  }

  _parseShapeRepresentation() {
    for (const [id, entity] of this.parser.entities) {
      if (entity.type.startsWith("IFCSHAPEREPRESENTATION")) {
        const items = entity.args[3]?.replace(/^$#/, "").split(",#");
        if (items) {
          items.forEach((itemId) => {
            const item = this.parser.entities.get(itemId);
            if (item && item.type.startsWith("IFCEXTRUDEDAREASOLID")) {
              console.log("IFC4: Menemukan ekstrusi:", itemId);
            }
          });
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
          console.log("IFC4: Menemukan pemetaan:", mapId);
        }
      }
    }
  }
}
