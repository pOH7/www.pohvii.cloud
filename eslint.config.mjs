import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import tailwindcssPlugin from "eslint-plugin-better-tailwindcss";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import * as jsoncParser from "jsonc-eslint-parser";
import { fixupPluginRules } from "@eslint/compat";

const compatNextPlugin = fixupPluginRules(nextPlugin);
const compatReactPlugin = fixupPluginRules(reactPlugin);
const compatReactHooksPlugin = fixupPluginRules(reactHooksPlugin);
const compatJsxA11yPlugin = fixupPluginRules(jsxA11yPlugin);
const compatTailwindcssPlugin = fixupPluginRules(tailwindcssPlugin);

const eslintConfig = tseslint.config(
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "public/**",
      "*.config.{js,mjs,cjs,ts,mts,cts}",
      "package-lock.json",
      "pnpm-lock.yaml",
      "yarn.lock",
    ],
  },
  // Package.json config - allows Next.js to detect the plugin
  {
    files: ["package.json"],
    plugins: {
      "@next/next": compatNextPlugin,
    },
    languageOptions: {
      parser: jsoncParser,
    },
    rules: {},
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}"],
    plugins: {
      "@next/next": compatNextPlugin,
      react: compatReactPlugin,
      "react-hooks": compatReactHooksPlugin,
      "jsx-a11y": compatJsxA11yPlugin,
      "better-tailwindcss": compatTailwindcssPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
      "better-tailwindcss": {
        // Tailwind CSS 4 uses CSS-based configuration
        entryPoint: "app/globals.css",
      },
    },
    rules: {
      // Next.js
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "@next/next/no-img-element": "warn",

      // React
      ...reactPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",

      // React Hooks
      ...reactHooksPlugin.configs.recommended.rules,

      // JSX A11y
      ...jsxA11yPlugin.configs.recommended.rules,

      // Tailwind CSS - using recommended config but disabling formatting rules
      // as Prettier with prettier-plugin-tailwindcss handles formatting
      ...tailwindcssPlugin.configs.recommended.rules,
      "better-tailwindcss/enforce-consistent-class-order": "off",
      "better-tailwindcss/enforce-consistent-line-wrapping": "off",
      // Allow complex prose/styling classes that are defined in globals.css
      "better-tailwindcss/no-unknown-classes": [
        "error",
        {
          ignore: [
            "blog-article-content",
            "utterances-container",
            "section-title",
          ],
        },
      ],

      // General
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
    },
  },
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // TypeScript
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unnecessary-condition": "warn",
    },
  },
  prettierConfig
);

export default eslintConfig;
