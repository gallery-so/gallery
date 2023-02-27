import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { FeedTabNavigatorParamList, FeedTabNavigatorProp } from '~/navigation/types';

type TabItemProps = {
  activeRoute: keyof FeedTabNavigatorParamList;
  route: keyof FeedTabNavigatorParamList;
};

function TabItem({ route, activeRoute }: TabItemProps) {
  const navigation = useNavigation<FeedTabNavigatorProp>();

  const isFocused = activeRoute === route;

  const onPress = useCallback(() => {
    if (!isFocused) {
      navigation.navigate(route, {});
    }
  }, [isFocused, navigation, route]);

  return (
    <TouchableOpacity
      className={`px-2`}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
    >
      <Text
        className={`${isFocused ? 'text-offBlack' : 'text-metal'}`}
        style={{ fontFamily: 'ABCDiatypeMedium', fontSize: 18 }}
      >
        {route}
      </Text>
    </TouchableOpacity>
  );
}

export function TabBar({ state }: MaterialTopTabBarProps) {
  const activeRoute = state.routeNames[state.index] as keyof FeedTabNavigatorParamList;

  return (
    <View className="flex flex-row items-center justify-center px-4 py-3">
      <TabItem activeRoute={activeRoute} route="Trending" />
      <TabItem activeRoute={activeRoute} route="Latest" />
      <TabItem activeRoute={activeRoute} route="Featured" />
    </View>
  );
}
