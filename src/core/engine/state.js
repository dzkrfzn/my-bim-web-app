// src/core/engine/state.js

import { createIdentityMatrix } from "./utils.js";

export const state = {
  modelMatrix: createIdentityMatrix(),
  viewMatrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -5, 1],
  projectionMatrix: [],
  rotation: {
    x: 0,
    y: 0,
    z: 0,
  },
  zoom: -5,
  pan: {
    x: 0,
    y: 0,
  },
};
