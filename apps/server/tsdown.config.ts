import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "./src/index.ts",
  format: "esm",
  outDir: "./dist",
  clean: true,
  deps: {
    alwaysBundle: [/@smilecraft-clinic\/.*/],
    neverBundle: ["cloudflare:workers"],
  },
});
