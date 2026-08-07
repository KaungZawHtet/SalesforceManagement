// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ***REMOVED***
    ignores: ['eslint.config.mjs'],
  ***REMOVED***,
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  ***REMOVED***
    languageOptions: ***REMOVED***
      globals: ***REMOVED***
        ...globals.node,
        ...globals.jest,
  ***REMOVED***
      sourceType: 'commonjs',
      parserOptions: ***REMOVED***
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
  ***REMOVED***
***REMOVED***
  ***REMOVED***,
  ***REMOVED***
    rules: ***REMOVED***
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      "prettier/prettier": ["error", ***REMOVED*** endOfLine: "auto" ***REMOVED***],
***REMOVED***
  ***REMOVED***,
);
