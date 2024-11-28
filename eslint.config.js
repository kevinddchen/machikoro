const eslint = require('@eslint/js');
const react = require('eslint-plugin-react');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  {
    ignores: ['build/', 'dist/'],
  },
  {
    extends: [
      eslint.configs.recommended,
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      react,
    },
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      'sort-imports': ['error', { allowSeparatedGroups: true }],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
);
