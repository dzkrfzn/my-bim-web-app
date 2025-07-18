// src/data/ifc/ifc-entity.js

export class IFCEntity {
  constructor(parser) {
    this.parser = parser;
    this.elements = [];
  }

  extractElements() {
    for (const [id, entity] of this.parser.entities) {
      if (entity.type.startsWith("IFC")) {
        this.elements.push({
          id,
          type: entity.type,
          attributes: this.extractAttributes(entity.args),
        });
      }
    }
    return this.elements;
  }

  extractAttributes(args) {
    // Sederhana: ambil beberapa atribut pertama
    return {
      name: args[0]?.replace(/^'(.*)'$/, "$1") || "Unnamed",
      description: args[1]?.replace(/^'(.*)'$/, "$1") || "",
    };
  }
}
