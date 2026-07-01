import js from '@eslint/js';
import tseslint from 'typescript-eslint';
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
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Honor the leading-underscore convention for intentionally-unused
      // bindings (ignored callback params, destructuring-omit idioms).
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      // Full react-hooks v7 ruleset, treated as errors (including the
      // React-Compiler-oriented rules: refs, set-state-in-effect, immutability,
      // preserve-manual-memoization).
      ...reactHooks.configs.recommended.rules,
      // Advisory only: the v7 rule can't see through the `useLatest` custom hook,
      // so it flags deliberately-stable refs as missing deps (~90 false positives
      // across the optimistic-state controls). v7 dropped the stable-hook config
      // option, so we keep it as a warning to preserve signal without noise.
      'react-hooks/exhaustive-deps': 'warn',

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
        // House convention: never use a BARE array index as a React key. Index
        // combined with a stable identifier (key={`row-${id}-${i}`}) is allowed;
        // only a lone index — key={i} or key={`${i}`} — is forbidden. Matched by
        // the conventional index names (i / idx / index); a value-named binding
        // like key={opt} is a legitimate content key and is not flagged.
        {
          selector: 'JSXAttribute[name.name="key"] > JSXExpressionContainer > Identifier[name=/^(i|idx|index)$/]',
          message: 'Do not use a bare array index as a key. Combine it with a stable identifier (e.g. key={`row-${id}-${i}`}).',
        },
        {
          selector: 'JSXAttribute[name.name="key"] > JSXExpressionContainer > TemplateLiteral[quasis.length=1][expressions.length=1] > Identifier[name=/^(i|idx|index)$/]',
          message: 'Do not use a bare array index as a key. Combine it with a stable identifier (e.g. key={`row-${id}-${i}`}).',
        },
      ],
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
