const { pathsToModuleNameMapper } = require('ts-jest');
const {
  compilerOptions: { paths },
} = require('./tsconfig.json');

module.exports = {
  setupFiles: ['<rootDir>/setupFile.js'],

  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },

  modulePaths: ['<rootDir>'],

  moduleNameMapper: {
    // Ensure all ouf our aliases from tsconfig work in jext
    ...pathsToModuleNameMapper(paths, { prefix: '<rootDir>/' }),
  },

  testEnvironment: 'jest-environment-jsdom',
};
