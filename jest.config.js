const { pathsToModuleNameMapper } = require('ts-jest/utils');
const {
  compilerOptions: { paths },
} = require('./tsconfig.json');

module.exports = {
  testEnvironment: 'jsdom',

  modulePaths: ['<rootDir>'],

  transform: {
    '^.+\\.(ts|tsx|js|jsx)?$': ['babel-jest'],
  },

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
