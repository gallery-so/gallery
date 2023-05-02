import { useCallback } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Typography } from '../../components/Typography';

type TabItemProps = {
  activeRoute: string;
  route: string;
  onRouteChange: (route: string) => void;
};

function TabItem({ activeRoute, route, onRouteChange }: TabItemProps) {
  const isFocused = activeRoute === route;

  const onPress = useCallback(() => {
    onRouteChange(route);
  }, [onRouteChange, route]);

  return (
    <TouchableOpacity
      className={`px-2`}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
    >
      <Typography
        className={`${isFocused ? 'text-offBlack dark:text-white' : 'text-metal'}`}
        font={{ family: 'ABCDiatype', weight: 'Medium' }}
      >
        {route}
      </Typography>
    </TouchableOpacity>
  );
}

type Props = {
  activeRoute: string;
  onRouteChange: (route: string) => void;
  routes: string[];
};

export function ProfileTabBar({ routes, activeRoute, onRouteChange }: Props) {
  return (
    <View className="border-porcelain dark:border-graphite mt-4 flex flex-row items-center justify-center border-t border-b px-2 py-3">
      {routes.map((route) => {
        return (
          <TabItem
            key={route}
            route={route}
            onRouteChange={onRouteChange}
            activeRoute={activeRoute}
          />
        );
      })}
    </View>
  );
}
