module.exports = {
  extends: ['xo', 'xo-react', 'prettier'],
  plugins: ['node'],
  rules: {
    'unicorn/filename-case': 'off',
    'unicorn/prefer-query-selector': 'off',
    'object-curly-spacing': ['error', 'always'],
    'func-names': 'off',
    camelcase: 'off',
    'node/prefer-global/process': ['error', 'always'],
    radix: 'off',
    'unicorn/no-array-reduce': 'off',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'capitalized-comments': 'off',

    'prefer-destructuring': 'off',

    // Typescript Specific Rules
    '@typescript-eslint/object-curly-spacing': ['error', 'always'],
    '@typescript-eslint/prefer-return-this-type': 'off',
    '@typescript-eslint/no-unused-expressions': [
      'error',
      { allowTernary: true },
    ],
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/no-empty-function': 'off',
  },
  overrides: [
    // Ensure we enable an ecmaVersion for all Javascript files
    {
      files: ['**/*.js', '**/*.cjs'],
      parserOptions: {
        ecmaVersion: '2020',
      },
    },

    // Typescript fields get the additional `xo-typescript` extends.
    {
      extends: ['xo', 'xo-react', 'xo-typescript', 'prettier'],
      files: ['**/*.ts*'],
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
