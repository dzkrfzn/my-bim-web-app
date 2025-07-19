// src/data/ifc/ifc-entity.js

export class IFCEntity {
  constructor(parser) {
    this.parser = parser;
    this.bimElements = [];
    this.metadataElements = [];
    this.geometryElements = [];
  }

  extractElements() {
    const bimTypes = [
      "IFCWALL",
      "IFCCOLUMN",
      "IFCSLAB",
      "IFCBEAM",
      "IFCSTAIR",
      "IFCROOF",
      "IFCWINDOW",
      "IFCDOOR",
      "IFCBEAM",
      "IFCFOOTING",
      "IFCMEMBER",
      "IFCPLATE",
      "IFCLOCALPLACEMENT",
      "IFCPRODUCTDEFINITIONSHAPE",
      "IFCINDEXEDPOLYGONALFACESET",
      "IFCMAPPEDITEM",
      "IFCEXTRUDEDAREASOLID",
      "IFCTRIANGULATEDFACESET",
    ];

    for (const [id, entity] of this.parser.entities) {
      const entityType = entity.type;

      // Klasifikasikan elemen
      if (bimTypes.some((type) => entityType.startsWith(type))) {
        const element = {
          id,
          type: entityType,
          attributes: this._parseAttributes(entityType, entity.args),
          raw: entity,
        };
        this.bimElements.push(element);
      } else if (entityType.startsWith("IFC")) {
        this.metadataElements.push({
          id,
          type: entityType,
          attributes: this._parseAttributes(entityType, entity.args),
        });
      }
    }

    console.log(
      "Metadata BIM: Jumlah elemen BIM nyata:",
      this.bimElements.length
    );
    console.table(this.bimElements.slice(0, 20));
    return this.bimElements;
  }

  _parseAttributes(entityType, args) {
    switch (entityType) {
      case "IFCWALL":
      case "IFCCOLUMN":
      case "IFCSLAB":
      case "IFCBEAM":
        return {
          name: args[0]?.replace(/^'|'$/g, "") || "Unnamed",
          description: args[1]?.replace(/^'|'$/g, "") || "",
          objectType: args[2]?.replace(/^'|'$/g, "") || "",
          globalId: args[3]?.replace(/^'|'$/g, "") || "",
          ownerHistory: args[4]?.replace(/^'|'$/g, "") || "",
          objectPlacement: args[5]?.replace(/^'|'$/g, "") || "",
          representation: args[6]?.replace(/^'|'$/g, "") || "",
          tag: args[7]?.replace(/^'|'$/g, "") || "",
        };
      case "IFCLOCALPLACEMENT":
        return {
          placementRelTo: args[0]?.replace(/^#/, ""),
          relativePlacement: args[1]?.replace(/^#/, ""),
        };
      case "IFCINDEXEDPOLYGONALFACESET":
        return {
          points:
            args[2]
              ?.replace(/^\(|$\s*$/g, "")
              .split(",")
              .map((p) => p.replace(/^#/, "")) || [],
          faceSet:
            args[3]
              ?.replace(/^\(|$\s*$/g, "")
              .split(",")
              .map((f) => f.replace(/^#/, "")) || [],
        };
      case "IFCMAPPEDITEM":
        return {
          mappingSource: args[0]?.replace(/^#/, ""),
          mappingTarget: args[1]?.replace(/^#/, ""),
        };
      case "IFCPRODUCTDEFINITIONSHAPE":
        return {
          name: args[0]?.replace(/^'|'$/g, "") || "",
          description: args[1]?.replace(/^'|'$/g, "") || "",
          representations: args[2]?.replace(/^$#/, "").split(",#") || [],
        };
      default:
        return {
          raw: args || [],
        };
    }
  }
}
