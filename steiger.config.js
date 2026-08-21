import { defineConfig } from "steiger";
import fsd from "@feature-sliced/steiger-plugin";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    files: ["./src/shared/**"],
    rules: {
      // shared segments (lib, ui) import freely — no public API required there
      "fsd/public-api": "off",
    },
  },
]);
