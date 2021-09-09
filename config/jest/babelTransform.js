// Const babelJest = require('babel-jest');
import babelJest from 'babel-jest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const hasJsxRuntime = (() => {
  if (process.env.DISABLE_NEW_JSX_TRANSFORM === 'true') {
    return false;
  }

  try {
    require.resolve('react/jsx-runtime');
    return true;
  } catch {
    return false;
  }
})();

const babelTransformer = babelJest.createTransformer({
  presets: [
    [
      require.resolve('babel-preset-react-app'),
      {
        runtime: hasJsxRuntime ? 'automatic' : 'classic',
      },
    ],
  ],
  babelrc: false,
  configFile: false,
});

export default babelTransformer;
