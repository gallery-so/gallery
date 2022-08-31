module.exports = {
  extends: ["next", "plugin:@typescript-eslint/recommended", "prettier"],
  plugins: ["@typescript-eslint"],
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
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
  },

  overrides: [
    {
      files: ["next.config.js", "jest.config.js"],
      rules: {
        // Okay to use require in these files
        "@typescript-eslint/no-var-requires": "off",
      }
    }
  ]
};
