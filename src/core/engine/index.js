// src/core/engine/index.js

import { IFCParser } from "../../data/ifc/ifc-parser.js";
import { IFCEntity } from "../../data/ifc/ifc-entity.js";
import { Renderer } from "./renderer.js";
import { Interaction } from "./interaction.js";

export class Engine {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl");
    this.renderer = new Renderer(this.gl);
    this.interaction = new Interaction(canvas, this.renderer);
  }

  async loadIFC(file) {
    if (!file || !file.name.endsWith(".ifc")) {
      alert("Silakan pilih file IFC yang valid.");
      return;
    }

    const text = await file.text();
    const parser = new IFCParser();
    await parser.parse(text);

    const entity = new IFCEntity(parser);
    const elements = entity.extractElements();

    const geometry = parser.extractGeometry(text);
    if (!geometry || !geometry.vertices || !geometry.indices) {
      console.warn("Tidak ada geometri yang dapat dirender.");
      return;
    }

    console.log("Parsing selesai. Menampilkan elemen BIM:");
    console.table(
      elements.filter((el) => el.type.startsWith("IFC")).slice(0, 20)
    );

    this.interaction.fitToView(geometry.vertices);
    this.renderer.render(geometry.vertices, geometry.indices);
  }

  _renderMetadata(elements) {
    const container = document.getElementById("metadata");
    container.innerHTML = "<h3>Metadata BIM</h3><ul>";

    elements.forEach((el) => {
      container.innerHTML += `
            <li>
                <strong>${el.type}</strong><br>
                ID: ${el.id}<br>
                Nama: ${el.attributes.name || "Unnamed"}<br>
                Deskripsi: ${el.attributes.description || ""}
                <hr>
            </li>`;
    });

    container.innerHTML += "</ul>";
  }
}
