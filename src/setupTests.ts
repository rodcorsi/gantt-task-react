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

// Mock HTMLCanvasElement.prototype.getContext
{
  Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
    value: function (_: string) {
      return {
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        getImageData: vi.fn(() => ({
          data: new Array(4).fill(0),
        })),
        putImageData: vi.fn(),
        createImageData: vi.fn(() => []),
        setTransform: vi.fn(),
        drawImage: vi.fn(),
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        stroke: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        rotate: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        measureText: vi.fn(() => ({ width: 0 })),
        transform: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
      };
    },
    writable: true,
    configurable: true,
  });
}

afterEach(() => {
  cleanup();
});
