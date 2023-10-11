/* eslint-disable @typescript-eslint/no-var-requires */
const { pathsToModuleNameMapper } = require('ts-jest');
const {
  compilerOptions: { paths },
} = require('./tsconfig.json');

const modulesToTranspile = [
  '@react-native',
  'react-native',
  'mixpanel-react-native',
  'expo-constants',
  'expo-modules-core',
];

module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/src/tests/setupFile.js'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setupFileAfterEnv.js'],
  transformIgnorePatterns: [`node_modules/(?!(${modulesToTranspile.join('|')})/)`],
  transform: {
    '\\.js$': [
      'babel-jest',
      { presets: ['module:metro-react-native-babel-preset', '@babel/preset-typescript'] },
    ],
    '^.+\\.jsx$': 'babel-jest',
    '^.+\\.tsx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    // Ensure all ouf our aliases from tsconfig work in jext
    ...pathsToModuleNameMapper(paths, { prefix: '<rootDir>/' }),
  },
};
