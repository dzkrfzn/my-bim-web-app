// src/data/ifc/ifc-identifier.js

import { IFC4Parser } from "./schemas/ifc4/parser.js";
import { IFC4Geometry } from "./schemas/ifc4/geometry.js";

export class IFCVersionResolver {
  static detectIFCVersion(ifcData) {
    const headerSection = ifcData.split("ENDSEC;")[0];

    // Coba deteksi dari FILE_SCHEMA
    const schemaMatch = headerSection.match(
      /FILE_SCHEMA\s*$\s*(IFC[0-9A-Za-z.]*)\s*$/
    );
    if (schemaMatch && schemaMatch[1]) {
      return schemaMatch[1].toUpperCase();
    }

    // Jika tidak ketemu, coba dari FILE_NAME atau FILE_DESCRIPTION
    const nameMatch = headerSection.match(/FILE_NAME\$[^']*'([^']+)'/);
    const descMatch = headerSection.match(/FILE_DESCRIPTION\$[^']*'([^']+)'/);

    if (nameMatch && nameMatch[1] && nameMatch[1].includes("IFC4")) {
      return "IFC4";
    }
    if (descMatch && descMatch[1] && descMatch[1].includes("IFC4")) {
      return "IFC4";
    }

    console.warn(
      "Versi IFC tidak terdeteksi. Menggunakan IFC4 sebagai default."
    );
    return "IFC4";
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
