// src/data/ifc/schemas/ifc4/geometry.js

export class IFC4Geometry {
  constructor(parser) {
    this.parser = parser;
    this.vertices = [];
    this.indices = [];
    this.pointMap = new Map(); // { id: index }
    this.faceSetMap = new Map(); // { id: indices }
    this.extrusionMap = new Map(); // { id: indices }
    this.mappedItems = new Map(); // { id: indices }
    this.placementMap = new Map(); // { id: placement data }
  }

  extractGeometry(data) {
    this._parsePoints();
    this._parsePolylines();
    this._parseArbitraryClosedProfileDef();
    this._parsePolygonalFaceSet();
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
            "IFCCARTESIANPOINT: Tidak ada koordinat valid untuk ID:",
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

  _parsePolylines() {
    for (const [id, entity] of this.parser.entities) {
      if (entity.type === "IFCPOLYLINE") {
        const coordsStr = entity.args[0]?.replace(/^\(|$\s*$/g, "");
        if (!coordsStr) continue;

        const coords = coordsStr
          .split(",")
          .map((coord) => coord.replace(/^#/, ""));
        const indices = [];

        for (let i = 1; i < coords.length - 1; i++) {
          const p0 = this.pointMap.get(coords[0]);
          const p1 = this.pointMap.get(coords[i]);
          const p2 = this.pointMap.get(coords[i + 1]);

          if (p0 !== undefined && p1 !== undefined && p2 !== undefined) {
            indices.push(p0, p1, p2);
          }
        }

        if (indices.length > 0) {
          this.faceSetMap.set(id, indices);
        }
      }
    }
    console.log("IFC4: Jumlah polyline:", this.faceSetMap.size);
  }

  _parseArbitraryClosedProfileDef() {
    for (const [id, entity] of this.parser.entities) {
      if (entity.type === "IFCARBITRARYCLOSEDPROFILEDEF") {
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
    const coords = polyline.args[0]
      ?.replace(/^\(|$\s*$/g, "")
      .split(",")
      .map((coord) => coord.replace(/^#/, ""));
    if (!coords) return;

    const indices = [];
    for (let i = 1; i < coords.length - 1; i++) {
      const p0 = this.pointMap.get(coords[0]);
      const p1 = this.pointMap.get(coords[i]);
      const p2 = this.pointMap.get(coords[i + 1]);

      if (p0 !== undefined && p1 !== undefined && p2 !== undefined) {
        indices.push(p0, p1, p2);
      }
    }

    if (indices.length > 0) {
      this.faceSetMap.set(parentId, indices);
    }
  }

  _parsePolygonalFaceSet() {
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
          console.log("Menemukan IFCLOCALPLACEMENT:", id);
          // Di sini tambahkan logika transformasi matriks jika diperlukan
        }
      }
    }
  }
}
