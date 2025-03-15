import { defineConfig } from "vitest/config";
import path from "node:path";
import react from "@vitejs/plugin-react-swc";

const isWatchMode = process.argv.includes("--watch");

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      name: "gantt-task-react",
      entry: path.resolve(__dirname, "src/index.tsx"),
      formats: ["es", "umd"],
      fileName: format => `gantt-task-react.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    cssCodeSplit: false,
    minify: isWatchMode ? false : true,
    sourcemap: isWatchMode ? "inline" : false,
    watch: isWatchMode ? {} : null,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    css: true,
    reporters: ["verbose"],
    coverage: {
      reporter: ["text", "json", "html"],
      include: ["src/**/*"],
      exclude: [],
    },
  },
});
