const eslint = require("@eslint/js");
const stylistic = require("@stylistic/eslint-plugin");
const reactPlugin = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");
const tseslint = require("typescript-eslint");

module.exports = tseslint.config({
  files: ["src/**/*.ts", "src/**/*.tsx"],
  languageOptions: {
  "parserOptions": {
    "project": "tsconfig.json"
  },
  },
  plugins: {
    "@stylistic": stylistic,
  },
  "extends": [
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    reactPlugin.configs.flat.recommended,
    reactHooks.configs["recommended-latest"],
  ],
  "rules": {
    "@stylistic/indent": [
      "error",
      2
    ]
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
});
