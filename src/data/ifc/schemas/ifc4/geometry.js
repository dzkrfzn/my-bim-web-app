// src/data/ifc/schemas/ifc4/geometry.js

export class IFC4Geometry {
  constructor(parser) {
    this.parser = parser;

    // Simpan koordinat titik dan indeks
    this.vertices = [];
    this.indices = [];

    // Mapping ID -> index
    this.pointMap = new Map(); // { id: index }
    this.faceSetMap = new Map(); // { id: indices }
    this.mappedItems = new Map(); // { id: shapeId }
    this.localPlacements = new Map(); // { id: placement }
  }

  /**
   * Fungsi utama untuk ekstraksi geometri dari file IFC4
   */
  extractGeometry(data) {
    // Parsing header untuk validasi
    this._parsePoints();
    this._parsePolylines();
    this._parseArbitraryClosedProfileDef();
    this._parsePolygonalFaceSet();
    this._parseExtrudedAreaSolid();
    this._parseShapeRepresentation();
    this._parseMappedItem();
    this._parseLocalPlacement();

    // Validasi hasil
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

  /**
   * 1. Parsing titik koordinat
   */
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

  /**
   * 2. Parsing polyline untuk membentuk wajah
   */
  _parsePolylines() {
    for (const [id, entity] of this.parser.entities) {
      if (entity.type === "IFCPOLYLINE") {
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

  /**
   * 3. Parsing profil tertutup (IFCARBITRARYCLOSEDPROFILEDEF)
   */
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

    this.faceSetMap.set(parentId, indices);
  }

  /**
   * 4. Parsing face set berbasis indeks
   */
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

  /**
   * 5. Parsing ekstrusi area solid
   */
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

  /**
   * 6. Parsing representasi bentuk
   */
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

  /**
   * 7. Parsing pemetaan objek (IFCMAPPEDITEM)
   */
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

  /**
   * 8. Parsing transformasi lokasi (IFCLOCALPLACEMENT)
   */
  _parseLocalPlacement() {
    for (const [id, entity] of this.parser.entities) {
      if (entity.type === "IFCLOCALPLACEMENT") {
        const placementId = entity.args[1]?.replace(/^#/, "");
        const placement = this.parser.entities.get(placementId);
        if (placement && placement.type === "IFCAXIS2PLACEMENT3D") {
          console.log("Menemukan IFCLOCALPLACEMENT:", id);
          // Di sini Anda bisa tambahkan transformasi matriks jika diperlukan
        }
      }
    }
  }
}
