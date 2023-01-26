const { pathsToModuleNameMapper } = require('ts-jest');
const {
  compilerOptions: { paths },
} = require('./tsconfig.json');

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

module.exports = async () => {
  const nextJestConfig = await createJestConfig({
    setupFilesAfterEnv: ['<rootDir>/tests/setupFileAfterEnv.js'],
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
    testEnvironment: 'jest-environment-jsdom',
  })();

  // Rainbow kit and nextjs-routes ship code which is not transpiled. We have to tell Jest to transpile it
  // https://stackoverflow.com/questions/55794280/jest-fails-with-unexpected-token-on-import-statement
  const modulesToTranspile = ['nextjs-routes', '@rainbow-me/rainbowkit'];

  return {
    ...nextJestConfig,

    transformIgnorePatterns: [`node_modules/(?!(${modulesToTranspile.join('|')})/)`],
  };
};
