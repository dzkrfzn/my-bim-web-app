// src/data/ifc/ifc-parser.js

export class IFCParser {
  constructor() {
    this.entities = new Map(); // { id: { type, args } }
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
    return this.entities;
  }

  parseArgs(content) {
    const match = content.match(/^\w+$(.*?)$/);
    if (!match) return [];
    return match[1].split(",").map((arg) => arg.trim());
  }
}
