// src/core/engine/index.js

import { IFCParser } from "../../data/ifc/ifc-parser.js";
import { IFCGeometry } from "../../data/ifc/ifc-geometry.js";
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
      console.error("File tidak valid atau bukan file IFC.");
      return;
    }

    console.log("Memulai parsing file IFC...");
    const text = await file.text();
    const parser = new IFCParser();
    await parser.parse(text);

    const geometry = new IFCGeometry(parser);
    const { vertices, indices } = geometry.extractGeometry();

    const entity = new IFCEntity(parser);
    const elements = entity.extractElements();

    console.log("Parsing selesai. Menampilkan metadata elemen:");
    console.table(elements.slice(0, 10));

    if (vertices.length === 0 || indices.length === 0) {
      console.warn("Tidak ada geometri yang dapat dirender.");
      return;
    }

    this.interaction.fitToView(vertices);
    this.renderer.render(vertices, indices);
  }
}
