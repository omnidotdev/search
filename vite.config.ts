import { resolve } from "node:path";

import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig(({ mode }) => ({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ["src/**/*"],
      exclude: ["**/*.test.*", "**/*.spec.*"],
      outDir: "build",
    }),
  ],
  build: {
    outDir: "build",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "OmniSearch",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
    },
    minify: mode === "production",
    rollupOptions: {
      external: ["meilisearch"],
      output: {
        globals: {
          meilisearch: "meilisearch",
        },
      },
    },
  },
}));
