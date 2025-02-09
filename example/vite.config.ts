import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
const __dirname = import.meta.dirname;
// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: __dirname + "/src/setupTests.ts",
    css: true,
    reporters: ["verbose"],
    coverage: {
      reporter: ["text", "json", "html"],
      include: ["src/**/*"],
      exclude: [],
    },
  },
});
