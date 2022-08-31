module.exports = {
  extends: ["next", "prettier"],
  plugins: ["@typescript-eslint"],
  ignorePatterns: ['*.graphql.ts', 'src/__generated__/operations.ts'],

  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',

    // Typescript Specific Rules
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/object-curly-spacing': ['error', 'always'],
    '@typescript-eslint/no-unused-expressions': ['error', { allowTernary: true }],
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
  },
};
