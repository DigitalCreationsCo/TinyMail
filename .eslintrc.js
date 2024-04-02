module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:i18next/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint', 'i18next', 'prettier'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'prettier/prettier': ['warn'],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off', // Disable the rule for JavaScript files
      },
    },
    {
      files: ['seed.ts'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: [
        'components/defaultLanding/**/*.tsx',
        'components/emailTemplates/**/*.tsx',
        'pages/index.tsx',
      ],
      rules: {
        'i18next/no-literal-string': 'off',
      },
    },
  ],
};
