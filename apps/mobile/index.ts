import { polyfill as polyfillEncoding } from "react-native-polyfill-globals/src/encoding";
import { polyfill as polyfillFetch } from "react-native-polyfill-globals/src/fetch";
import { polyfill as polyfillReadableStream } from "react-native-polyfill-globals/src/readable-stream";

polyfillEncoding();
polyfillFetch();
polyfillReadableStream();

import registerRootComponent from "expo/build/launch/registerRootComponent";

import App from "./App";

registerRootComponent(App);
