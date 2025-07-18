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
    const text = await file.text();
    const parser = new IFCParser();
    parser.parse(text);

    const geometry = new IFCGeometry(parser);
    const { vertices, indices } = geometry.extractGeometry();

    const entities = new IFCEntity(parser);
    const elements = entities.extractElements();

    console.log("Elements:", elements);

    this.renderer.render(vertices, indices);
  }
}
