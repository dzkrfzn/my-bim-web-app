// src/data/ifc/ifc-parser.js

import { IFCVersionResolver } from "./ifc-identifier.js";

export class IFCParser {
  constructor() {
    this.entities = new Map();
  }

  async parse(data) {
    const version = IFCVersionResolver.detectIFCVersion(data);
    console.log("Versi IFC terdeteksi:", version);

    const parser = IFCVersionResolver.getParser(version);
    this.entities = parser.parse(data);
    return this.entities;
  }

  async extractGeometry(data) {
    const version = IFCVersionResolver.detectIFCVersion(data);
    const geometry = IFCVersionResolver.getGeometry(version, this);
    return geometry.extractGeometry();
  }
}
