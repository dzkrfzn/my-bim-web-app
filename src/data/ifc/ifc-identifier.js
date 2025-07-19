// src/data/ifc/ifc-identifier.js

// Import parser dan geometry dari skema IFC yang sesuai
import { IFC2X3Parser } from "./schemas/ifc2x3/parser.js";
import { IFC2X3Geometry } from "./schemas/ifc2x3/geometry.js";

import { IFC4Parser } from "./schemas/ifc4/parser.js";
import { IFC4Geometry } from "./schemas/ifc4/geometry.js";

import { IFC4_3Parser } from "./schemas/ifc4_3/parser.js";
import { IFC4_3Geometry } from "./schemas/ifc4_3/geometry.js";

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
      case "IFC2X3":
        return new IFC2X3Parser();
      case "IFC4":
        return new IFC4Parser();
      case "IFC4.3":
        return new IFC4_3Parser();
      default:
        console.warn(
          `Skema IFC tidak didukung: ${version}. Menggunakan parser default IFC4.`
        );
        return new IFC4Parser();
    }
  }

  static getGeometry(version, parser) {
    switch (version) {
      case "IFC2X3":
        return new IFC2X3Geometry(parser);
      case "IFC4":
        return new IFC4Geometry(parser);
      case "IFC4.3":
        return new IFC4_3Geometry(parser);
      default:
        console.warn(
          `Skema IFC tidak didukung: ${version}. Menggunakan geometri IFC4.`
        );
        return new IFC4Geometry(parser);
    }
  }
}
