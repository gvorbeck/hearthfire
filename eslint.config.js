import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default tseslint.config(
  // Ignore build output, deps, and non-app scripts (Firestore admin tooling).
  { ignores: ['dist', 'coverage', 'node_modules', 'scripts'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Full react-hooks v7 ruleset, treated as errors (including the
      // React-Compiler-oriented rules: refs, set-state-in-effect, immutability,
      // preserve-manual-memoization).
      ...reactHooks.configs.recommended.rules,
      'react-hooks/exhaustive-deps': 'error',

      // Fast-refresh boundary — components-only exports.
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // House convention: arrow functions only — no `function` declarations.
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'FunctionDeclaration',
          message: 'Use an arrow function assigned to a const instead of a function declaration.',
        },
      ],

      // House convention: never use a bare array index as a React key.
      'react/no-array-index-key': 'error',
    },
  },

  // Test files: allow node/vitest globals.
  {
    files: ['**/*.test.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, ...globals.vitest },
    },
  },
);
