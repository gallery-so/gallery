import { useCallback } from 'react';
import { View } from 'react-native';

import { contexts } from '~/shared/analytics/constants';

import { Typography } from '../../components/Typography';
import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';

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
    <GalleryTouchableOpacity
      className={`px-2`}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      eventElementId="Followers Tab"
      eventName="Followers Tab Clicked"
      eventContext={contexts.Social}
      properties={{ variant: route }}
    >
      <Typography
        className={`text-sm ${isFocused ? 'text-black-800 dark:text-offWhite' : 'text-metal'}`}
        font={{ family: 'ABCDiatype', weight: 'Medium' }}
      >
        {route}
      </Typography>
    </GalleryTouchableOpacity>
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
