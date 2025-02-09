import "@testing-library/jest-dom";

import { afterEach, vi } from "vitest";

import { cleanup } from "@testing-library/react";

// Mock createSVGPoint if it's not implemented in jsdom
if (
  typeof SVGElement !== "undefined" &&
  !SVGElement.prototype.hasOwnProperty("createSVGPoint")
) {
  Object.defineProperty(SVGElement.prototype, "createSVGPoint", {
    value: function () {
      return {
        matrixTransform: vi.fn(() => ({ x: 0, y: 0 })),
        x: 0,
        y: 0,
      };
    },
    writable: true,
    configurable: true,
  });
}

// Mock getBBox if it's not implemented in jsdom, likely on SVGTextElement
if (
  typeof SVGElement !== "undefined" &&
  !SVGElement.prototype.hasOwnProperty("getBBox")
) {
  Object.defineProperty(SVGElement.prototype, "getBBox", {
    value: function () {
      return {
        // Minimal mock of SVGRect returned by getBBox
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      };
    },
    writable: true,
    configurable: true,
  });
}

afterEach(() => {
  cleanup();
});
