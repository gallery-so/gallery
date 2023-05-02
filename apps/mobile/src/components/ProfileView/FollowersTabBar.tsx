import { useCallback } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Typography } from '../../components/Typography';

const routes = ['Followers', 'Following'] as const;
export type FollowersTabName = (typeof routes)[number];

type TabItemProps = {
  activeRoute: string;
  route: FollowersTabName;
  onRouteChange: (route: FollowersTabName) => void;
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
        className={`text-sm ${isFocused ? 'text-offBlack dark:text-offWhite' : 'text-metal'}`}
        font={{ family: 'ABCDiatype', weight: 'Medium' }}
      >
        {route}
      </Typography>
    </TouchableOpacity>
  );
}

type Props = {
  activeRoute: FollowersTabName;
  onRouteChange: (route: FollowersTabName) => void;
};

export function FollowersTabBar({ activeRoute, onRouteChange }: Props) {
  return (
    <View className="flex flex-row items-center justify-center py-3">
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
