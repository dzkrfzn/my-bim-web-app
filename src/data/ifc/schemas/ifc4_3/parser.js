// src/data/ifc/schemas/ifc4_3/parser.js

export class IFC4_3Parser {
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
      const args = this.parseArgs(rest.join("=").trim());

      this.entities.set(id, { type: type.trim(), args });
    }
    console.log("IFC4.3: Parsing selesai. Jumlah entitas:", this.entities.size);
    return this.entities;
  }

  parseArgs(content) {
    if (!content) return [];
    const match = content.match(/^\w+$(.*?)$/);
    if (!match) return [];
    return match[1].split(",").map((arg) => arg.trim().replace(/^'|'$/g, ""));
  }
}
