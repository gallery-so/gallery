import registerRootComponent from 'expo/build/launch/registerRootComponent';
import { LogBox } from 'react-native';
// @ts-expect-error No type declarations
import { polyfill as polyfillEncoding } from 'react-native-polyfill-globals/src/encoding';
// @ts-expect-error No type declarations
import { polyfill as polyfillFetch } from 'react-native-polyfill-globals/src/fetch';
// @ts-expect-error No type declarations
import { polyfill as polyfillReadableStream } from 'react-native-polyfill-globals/src/readable-stream';
import { enableFreeze } from 'react-native-screens';
import * as Sentry from 'sentry-expo';

// Unimportant warnings from the fetch polyfill
LogBox.ignoreLogs(["The provided value 'moz", "The provided value 'ms-stream"]);

polyfillEncoding();
polyfillFetch();
polyfillReadableStream();

enableFreeze(true);

Sentry.init({
  dsn: 'https://c26c57d7db254a8f9805fa316c6d2055@o1135798.ingest.sentry.io/4504770503114752',
  enableInExpoDevelopment: true,

  // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
  debug: true,
});

import App from './App';

registerRootComponent(App);
