// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist', 'node_modules'],
  },

  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,

  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    rules: {
      /*
       * ─────────────────────────────────────────────
       * NestJS + DTO Friendly Rules
       * ─────────────────────────────────────────────
       */

      // Allow DTO flexibility
      '@typescript-eslint/no-explicit-any': 'off',

      // Required for async controller/service methods
      '@typescript-eslint/no-floating-promises': 'warn',

      '@typescript-eslint/no-unsafe-argument': 'warn',

      // Disable strict property initialization for DTOs
      '@typescript-eslint/consistent-type-definitions': ['error', 'class'],

      // Allow empty constructors (common in DTOs)
      '@typescript-eslint/no-empty-function': 'off',

      // Allow non-null assertion (sometimes needed in decorators)
      '@typescript-eslint/no-non-null-assertion': 'off',

      // Required for class-validator decorators
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],

      /*
       * ─────────────────────────────────────────────
       * Prettier
       * ─────────────────────────────────────────────
       */
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
);
