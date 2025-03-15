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

afterEach(() => {
  cleanup();
});
