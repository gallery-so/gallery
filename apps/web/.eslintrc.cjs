module.exports = {
  extends: ['next', 'plugin:@typescript-eslint/recommended', 'prettier', 'plugin:relay/strict'],
  plugins: ['@typescript-eslint', 'simple-import-sort', 'relay'],
  ignorePatterns: ['*.graphql.ts', 'src/__generated__/operations.ts'],

  rules: {
    'react/no-unescaped-entities': 'off',

    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',

    // Typescript Specific Rules
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/object-curly-spacing': ['error', 'always'],
    '@typescript-eslint/prefer-return-this-type': 'off',
    '@typescript-eslint/no-unused-expressions': ['error', { allowTernary: true }],
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/switch-exhaustiveness-check': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    '@typescript-eslint/no-explicit-any': 'error',

    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',

    // Relay
    'relay/graphql-syntax': 'error',
    'relay/compat-uses-vars': 'warn',
    'relay/graphql-naming': 'error',
    'relay/generated-flow-types': 'off',
    'relay/must-colocate-fragment-spreads': 'error',
    'relay/no-future-added-value': 'error',
    'relay/unused-fields': 'warn',
    // Typescript does this for us
    'relay/function-required-argument': 'off',
    // Typescript does this for us
    'relay/hook-required-argument': 'off',
  },

  overrides: [
    {
      files: ['next.config.js', 'jest.config.js', 'scripts/**/*'],
      rules: {
        // Okay to use require in these files
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
