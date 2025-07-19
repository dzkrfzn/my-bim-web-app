// src/data/ifc/ifc-identifier.js

import { IFC4Parser } from "./schemas/ifc4/parser.js";
import { IFC4Geometry } from "./schemas/ifc4/geometry.js";

export class IFCVersionResolver {
  static detectIFCVersion(ifcData) {
    const headerSection = ifcData.split("ENDSEC;")[0];
    const schemaMatch = headerSection.match(
      /FILE_SCHEMA\s*$\s*(IFC[0-9A-Za-z.]*)\s*$/
    );
    if (schemaMatch && schemaMatch[1]) {
      return schemaMatch[1].toUpperCase();
    }
    return "UNKNOWN";
  }

  static getParser(version) {
    switch (version) {
      case "IFC4":
        return new IFC4Parser();
      default:
        console.warn(
          `Skema IFC tidak didukung: ${version}. Menggunakan parser default IFC4.`
        );
        return new IFC4Parser();
    }
  }

  static getGeometry(version, parser) {
    switch (version) {
      case "IFC4":
        return new IFC4Geometry(parser);
      default:
        console.warn(
          `Skema IFC tidak didukung: ${version}. Menggunakan geometri IFC4.`
        );
        return new IFC4Geometry(parser);
    }
  }
}
