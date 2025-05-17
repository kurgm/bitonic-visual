// @ts-check

import eslint from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config({
  files: ["src/**/*.ts", "src/**/*.tsx"],
  languageOptions: {
    parserOptions: {
      project: "tsconfig.json",
    },
  },
  plugins: {
    "@stylistic": stylistic,
  },
  extends: [
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    reactPlugin.configs.flat.recommended,
    reactHooks.configs["recommended-latest"],
  ],
  rules: {
    "@stylistic/indent": ["error", 2],
  },
  settings: {
    react: {
      version: "detect",
    },
  },
});
