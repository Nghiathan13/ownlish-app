import stylelintConfigRecommended from "stylelint-config-recommended";
import stylelintDeclarationStrictValue from "stylelint-declaration-strict-value";

export default {
  extends: ["stylelint-config-recommended"],
  plugins: [stylelintDeclarationStrictValue],
  rules: {
    // color governance: every color must come from a design token (var(--...))
    "scale-unlimited/declaration-strict-value": [
      ["/color$/", "fill", "stroke"],
      {
        ignoreValues: ["currentColor", "transparent", "inherit", "initial", "unset", "none"],
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
};
