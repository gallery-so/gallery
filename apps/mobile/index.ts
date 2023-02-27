import registerRootComponent from 'expo/build/launch/registerRootComponent';
import { LogBox } from 'react-native';
// @ts-expect-error No type declarations
import { polyfill as polyfillEncoding } from 'react-native-polyfill-globals/src/encoding';
// @ts-expect-error No type declarations
import { polyfill as polyfillFetch } from 'react-native-polyfill-globals/src/fetch';
// @ts-expect-error No type declarations
import { polyfill as polyfillReadableStream } from 'react-native-polyfill-globals/src/readable-stream';
import { enableFreeze } from 'react-native-screens';

// Unimportant warnings from the fetch polyfill
LogBox.ignoreLogs(["The provided value 'moz", "The provided value 'ms-stream"]);
LogBox.ignoreLogs(['Could not render FeedEvent']);

polyfillEncoding();
polyfillFetch();
polyfillReadableStream();

enableFreeze(true);

import App from './App';

registerRootComponent(App);
