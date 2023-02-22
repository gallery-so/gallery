import registerRootComponent from "expo/build/launch/registerRootComponent";
import { enableFreeze } from "react-native-screens";

enableFreeze(true);

import App from "./App";

registerRootComponent(App);
