import {
  createMaterialTopTabNavigator,
  MaterialTopTabBarProps,
} from "@react-navigation/material-top-tabs";
import { AccountScreen } from "src/screens/AccountScreen";
import { HomeScreen } from "src/screens/HomeScreen";
import { NotificationsScreen } from "src/screens/NotificationsScreen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TouchableOpacity, View } from "react-native";

import Svg, { Path, SvgProps, G, Rect, Defs, ClipPath } from "react-native-svg";

const NotificationsLogo = (props: SvgProps) => (
  <Svg width={25} height={24} fill="none" {...props}>
    <G clipPath="url(#a)">
      <Path
        d="m21.5 15.188-3-3.9V6.411L15.5 3h-6l-3 3.412v4.875l-3 3.9v2.438h18v-2.438Z"
        stroke="#000"
      />
      <Path
        d="M14.75 18.75a2.25 2.25 0 0 1-4.5 0"
        stroke="#000"
        strokeLinejoin="bevel"
      />
      <Rect x={15.5} y={1} width={8} height={8} rx={4} fill="#0022F0" />
      <Rect
        x={15.5}
        y={1}
        width={8}
        height={8}
        rx={4}
        stroke="#0022F0"
        strokeWidth={2}
      />
    </G>
    <Defs>
      <ClipPath id="a">
        <Path fill="#fff" transform="translate(.5)" d="M0 0h24v24H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);

const AccountLogo = (props: SvgProps) => (
  <Svg width={25} height={24} fill="none" {...props}>
    <G stroke="#000">
      <Path d="M12.5 11.5a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 21v-4l3-3 4.5 1.5L17 14l3 3v4" />
    </G>
  </Svg>
);

const GLogo = (props: SvgProps) => (
  <Svg width={13} height={16} fill="none" {...props}>
    <Path
      d="M11.303 10.292c0-1.482.225-1.863 1.101-1.93v-.808H6.119v.807c2.132.09 3.256-.162 3.256 1.685l.006 2.95a3.814 3.814 0 0 1-.476 1.05c-.46.674-1.224.988-2.256.988-2.444 0-3.89-2.58-3.89-7.024S4.092.923 6.761.923c2.065 0 3.308 1.363 3.624 4.235h.92V.286h-.875c-.112.56-.203.718-.405.718C9.667 1.004 8.67 0 6.674 0 2.927 0 .458 3.36.458 8.094c0 4.779 2.36 7.875 6.236 7.875H6.7c2.287 0 3.016-1.525 3.172-2.011l.548 1.81h.876l.006-5.476Z"
      fill="#141414"
    />
  </Svg>
);

const Tab = createMaterialTopTabNavigator();

function TabBar({ state, navigation }: MaterialTopTabBarProps) {
  const { bottom } = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: 12,
        paddingBottom: bottom,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly",
        backgroundColor: "#F9F9F9",
      }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            // The `merge: true` option makes sure that the params inside the tab screen are preserved
            navigation.navigate(route.name, { merge: true });
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            style={{ paddingHorizontal: 12 }}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            onLongPress={onLongPress}
          >
            {route.name === "Account" && <AccountLogo />}
            {route.name === "Home" && <GLogo />}
            {route.name === "Notifications" && <NotificationsLogo />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function MainTabNavigator() {
  const { top } = useSafeAreaInsets();

  return (
    <Tab.Navigator
      tabBarPosition="bottom"
      initialRouteName="Home"
      tabBar={TabBar}
      sceneContainerStyle={{ paddingTop: top, backgroundColor: "white" }}
    >
      <Tab.Screen name="Account" component={AccountScreen} />
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
    </Tab.Navigator>
  );
}
