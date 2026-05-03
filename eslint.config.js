import js from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"
import reactPlugin from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "public/vite*/**",
      "tmp/**",
      "log/**",
      "storage/**",
      "app/assets/builds/**",
      "vendor/**",
      "coverage/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["app/frontend/**/*.{ts,tsx,js,jsx}", "vite.config.ts", "vitest.config.ts"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  }
)
