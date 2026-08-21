import stylelintConfigRecommended from "stylelint-config-recommended";
import stylelintDeclarationStrictValue from "stylelint-declaration-strict-value";
import cssPropertyTypeValidator from "@schalkneethling/stylelint-plugin-css-property-type-validator";

export default {
  extends: ["stylelint-config-recommended"],
  plugins: [stylelintDeclarationStrictValue, cssPropertyTypeValidator],
  rules: {
    // color governance: every color must come from a design token (var(--...))
    "scale-unlimited/declaration-strict-value": [
      ["/color$/", "fill", "stroke"],
      {
        ignoreValues: ["currentColor", "transparent", "inherit", "initial", "unset", "none"],
      },
    ],
    // no literal colors via color functions in components (tokens file exempt below)
    "function-disallowed-list": [
      "rgb",
      "rgba",
      "hsl",
      "hsla",
      "hwb",
      "lab",
      "lch",
      "oklab",
      "oklch",
      "color",
      "light-dark",
    ],
    // var(--token) must reference an existing token (variables.css)
    "css-property-type-validator/valid-property-types": [
      true,
      {
        tokenFiles: ["src/app/styles/variables.css"],
        checkUnknownCustomProperties: true,
        registryFiles: [],
      },
    ],
    // no literal/named colors outside tokens
    "color-named": "never",
    "color-hex-length": "short",
    "color-no-invalid-hex": true,
    "color-function-notation": "modern",
    "alpha-value-notation": "percentage",
    "hue-degree-notation": "angle",
  },
  overrides: [
    {
      // tokens file is the single source of truth — color functions allowed there
      files: ["src/app/styles/variables.css"],
      rules: {
        "function-disallowed-list": null,
      },
    },
  ],
};
