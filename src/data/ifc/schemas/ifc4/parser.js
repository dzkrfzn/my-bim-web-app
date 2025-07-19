// src/data/ifc/schemas/ifc4/parser.js

export class IFC4Parser {
  constructor() {
    this.entities = new Map();
  }

  parse(data) {
    const lines = data.split("\n");
    for (let line of lines) {
      line = line.trim();
      if (!line.startsWith("#") || !line.endsWith(";")) continue;

      const idMatch = line.match(/^#(\d+)/);
      if (!idMatch) continue;

      const id = idMatch[1];
      const content = line.slice(idMatch[0].length + 1, -1).trim();
      const [type, ...rest] = content.split("=");
      const args = this._parseArgs(rest.join("=").trim());

      this.entities.set(id, { type: type.trim(), args });
    }
    console.log("IFC4: Parsing selesai. Jumlah entitas:", this.entities.size);
    return this.entities;
  }

  _parseArgs(content) {
    if (!content) return [];
    const match = content.match(/^\w+$(.*?)$/);
    if (!match) return [];
    return match[1].split(",").map((arg) => arg.trim().replace(/^'|'$/g, ""));
  }
}
