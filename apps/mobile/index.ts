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
  dsn: 'https://bd40a4affc1740e8b7516502389262fe@o1135798.ingest.sentry.io/6187637',
  enableInExpoDevelopment: true,

  // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
  debug: true,
});

import App from './App';

registerRootComponent(App);
