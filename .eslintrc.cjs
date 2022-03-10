// Rules needs to be duplciated in the TS overrides since we modify the `extends` field.
const rules = {
  'unicorn/filename-case': 'off',
  'unicorn/prefer-query-selector': 'off',
  'object-curly-spacing': ['error', 'always'],
  'func-names': 'off',
  camelcase: 'off',
  'node/prefer-global/process': ['error', 'always'],
  radix: 'off',
  'unicorn/no-array-reduce': 'off',
  'no-console': 'off',
  'capitalized-comments': 'off',
  'prefer-destructuring': 'off',
  'default-case': 'off',
  'max-params': 'off',

  // React Specific Rules
  'react/react-in-jsx-scope': 'off',
  'react/jsx-sort-props': 'off',
  'react/function-component-definition': 'off',
  'react/prop-types': 'off',
  'react/boolean-prop-naming': 'off',
  'react/jsx-key': 'warn',
  'react/jsx-pascal-case': 'off',
  'react/require-default-props': 'off',
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
};

module.exports = {
  ignorePatterns: ['next-env.d.ts', 'node_modules', 'build'],

  extends: ['prettier', 'react-hooks'],
  plugins: ['node'],
  rules,
  overrides: [
    // Ensure we enable an ecmaVersion for all Javascript files
    {
      files: ['**/*.js', '**/*.cjs'],
      parserOptions: {
        ecmaVersion: '2020',
      },
    },
    {
      extends: ['prettier'],
      files: ['**/*.ts*'],
      rules,
    },
    {
      files: ['scripts/**/*'],
      env: {
        node: true,
      },
      rules: {
        'no-console': 'off',
        'unicorn/no-process-exit': 'off',
      },
    },
    {
      files: 'dev_server/*.js',
      rules: {
        'unicorn/prefer-module': 'off',
      },
    },
    {
      files: ['config/pnpTs.js'],
      rules: {
        'unicorn/prefer-module': 'off',
      },
    },
  ],
};
