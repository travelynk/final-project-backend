// eslint.config.js
import globals from "globals";
import pluginJs from "@eslint/js";
import babelParser from "@babel/eslint-parser";

// /** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    languageOptions: {
      parser: babelParser,    // Menggunakan parser @babel/eslint-parser
      ecmaVersion: 2021,                 // Menggunakan versi ECMAScript 2021
      sourceType: 'module',              // Menetapkan modul ECMAScript
      globals: {
        ...globals.node,                 // Mengaktifkan variabel global untuk Node.js
        ...globals.browser               // Mengaktifkan variabel global untuk browser
      },
    }
  },
  pluginJs.configs.recommended,          // Menambahkan konfigurasi linting dari @eslint/js
];
