// src/data/ifc/ifc-entity.js

export class IFCEntity {
  constructor(parser) {
    this.parser = parser;
    this.elements = [];
  }

  extractElements() {
    for (const [id, entity] of this.parser.entities) {
      if (
        entity.type.startsWith("IFC") &&
        !entity.type.includes("IFCINDEXEDPOLYGONALFACESET") &&
        !entity.type.includes("IFCTRIANGULATEDFACESET")
      ) {
        this.elements.push({
          id,
          type: entity.type,
          attributes: this._parseAttributes(entity.args),
        });
      }
    }
    console.log("Metadata BIM: Jumlah elemen:", this.elements.length);
    return this.elements;
  }

  _parseAttributes(args) {
    return {
      name: args[0]?.replace(/^'(.*)'$/, "$1") || "Unnamed",
      description: args[1]?.replace(/^'(.*)'$/, "$1") || "",
    };
  }
}
