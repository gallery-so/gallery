import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TouchableOpacity, View } from "react-native";
import { AccountIcon } from "~/navigation/MainTabNavigator/AccountIcon";
import { GLogo } from "~/navigation/MainTabNavigator/GLogo";
import { NotificationsIcon } from "~/navigation/MainTabNavigator/NotificationsIcon";
import { ReactNode, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";

type TabItemProps = {
  route: string;
  icon: ReactNode;
};

function TabItem({ route, icon }: TabItemProps) {
  const navigation = useNavigation();

  const isFocused = true;

  const onPress = useCallback(() => {
    navigation.navigate(route);
  }, []);

  return (
    <TouchableOpacity
      className={`px-8 ${isFocused ? "opacity-100" : "opacity-25"}`}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
    >
      {icon}
    </TouchableOpacity>
  );
}

export function TabBar({ state, navigation }: MaterialTopTabBarProps) {
  const { bottom } = useSafeAreaInsets();

  return (
    <View
      style={{ paddingBottom: bottom }}
      className="pt-3 flex flex-row items-center justify-center bg-offWhite"
    >
      <TabItem route="Account" icon={<AccountIcon />} />
      <TabItem route="Home" icon={<GLogo />} />
      <TabItem route="Notifications" icon={<NotificationsIcon />} />
    </View>
  );
}
