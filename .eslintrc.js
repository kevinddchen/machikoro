module.exports = {
  env: {
    node: true,
    browser: true,
    es6: true,
  },

  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    // "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],

  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: '6',
    project: './tsconfig.json',
    sourceType: 'module',
    tsconfigRootDir: __dirname,
  },

  plugins: [
    'react',
    '@typescript-eslint',
  ],

  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
    'sort-imports': [
      'warn',
      {
        'allowSeparatedGroups': true,
      },
    ],
  },

  settings: {
    react: {
      version: 'detect',
    },
  },
};
