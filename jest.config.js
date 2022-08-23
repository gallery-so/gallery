const { pathsToModuleNameMapper } = require('ts-jest/utils');
const {
  compilerOptions: { paths },
} = require('./tsconfig.json');

module.exports = {
  // Have to use babel for tests until next js supports the relay transform for jest compilation
  transform: {
    '\\.[jt]sx?$': [
      'babel-jest',
      {
        presets: ['next/babel'],
        plugins: ['relay'],
      },
    ],
  },

  testEnvironment: 'jsdom',

  modulePaths: ['<rootDir>'],

  moduleNameMapper: {
    // Ensure all ouf our aliases from tsconfig work in jext
    ...pathsToModuleNameMapper(paths),

    // CSS imports should do nothing
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',

    // Images get a static string
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/test/__mocks__/fileMock.js',

    // React Markdown is an ESM Module which makes jest very angry
    'react-markdown': '<rootDir>/test/__mocks__/react-markdown.js',
  },
};
