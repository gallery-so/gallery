import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { AccountScreen } from "src/screens/AccountScreen";
import { HomeScreen } from "src/screens/HomeScreen";
import { NotificationsScreen } from "src/screens/NotificationsScreen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TabBar } from "~/navigation/MainTabNavigator/TabBar";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MainStackNavigatorParamList } from "~/navigation/types";

const Tab = createMaterialTopTabNavigator();
const Stack = createNativeStackNavigator<MainStackNavigatorParamList>();

function TabNavigator() {
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

function EmptyHeader() {
  return null;
}

export function MainTabNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Tabs"
      screenOptions={{ header: EmptyHeader }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} />
    </Stack.Navigator>
  );
}
