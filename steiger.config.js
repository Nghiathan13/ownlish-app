import { defineConfig } from "steiger";
import fsd from "@feature-sliced/steiger-plugin";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // same-slice imports relative, cross-slice imports absolute (via @/)
    rules: {
      "fsd/import-locality": "error",
    },
  },
  {
    files: ["./src/shared/**"],
    rules: {
      // shared segments (lib, ui) import freely — no public API required there
      "fsd/public-api": "off",
    },
  },
]);
