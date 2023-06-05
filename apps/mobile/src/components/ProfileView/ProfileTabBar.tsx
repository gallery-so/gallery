import { useCallback } from 'react';
import { Text, View } from 'react-native';

import { Typography } from '../../components/Typography';
import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';

type TabItemProps = {
  activeRoute: string;
  route: string;
  counter?: number;
  onRouteChange: (route: string) => void;
};

function TabItem({ activeRoute, counter = 0, route, onRouteChange }: TabItemProps) {
  const isFocused = activeRoute === route;

  const onPress = useCallback(() => {
    onRouteChange(route);
  }, [onRouteChange, route]);

  return (
    <GalleryTouchableOpacity
      className={`px-2`}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      eventElementId="Profile Tab"
      eventName="Profile Tab Clicked"
      properties={{ variant: route }}
    >
      <Typography
        className={`${isFocused ? 'text-black-800 dark:text-white' : 'text-metal'}`}
        font={{ family: 'ABCDiatype', weight: 'Medium' }}
      >
        {route}
        {counter > 0 && <Text className="text-xs"> {counter}</Text>}
      </Typography>
    </GalleryTouchableOpacity>
  );
}

type ProfileTabRoutes = {
  name: string;
  counter?: number;
};

type Props = {
  activeRoute: string;
  onRouteChange: (route: string) => void;
  routes: ProfileTabRoutes[];
};

export function ProfileTabBar({ routes, activeRoute, onRouteChange }: Props) {
  return (
    <View className="border-porcelain dark:border-black-500 mt-4 flex flex-row items-center justify-center border-t border-b px-2 py-3">
      {routes.map((route) => {
        return (
          <TabItem
            key={route.name}
            route={route.name}
            onRouteChange={onRouteChange}
            activeRoute={activeRoute}
            counter={route.counter}
          />
        );
      })}
    </View>
  );
}
