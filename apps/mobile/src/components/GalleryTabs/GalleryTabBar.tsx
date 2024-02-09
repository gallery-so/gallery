import { useCallback, useMemo } from 'react';
import { Text, View, ScrollView } from 'react-native';

import { GalleryElementTrackingProps } from '~/shared/contexts/AnalyticsContext';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { Typography } from '../Typography';

type TabItemProps = {
  activeRoute: string;
  route: string;
  counter?: number;
  onRouteChange: (route: string) => void;
} & GalleryElementTrackingProps;

function TabItem({
  activeRoute,
  counter = 0,
  route,
  onRouteChange,
  eventElementId,
  eventName,
  eventContext,
  eventFlow,
}: TabItemProps) {
  const isFocused = activeRoute === route;

  const onPress = useCallback(() => {
    onRouteChange(route);
  }, [onRouteChange, route]);

  return (
    <GalleryTouchableOpacity
      className={`px-2 flex flex-row items-center justify-center space-x-1`}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      eventElementId={eventElementId}
      eventName={eventName}
      eventContext={eventContext}
      eventFlow={eventFlow}
      properties={{ variant: route }}
    >
      <Typography
        className={`tracking-tight ${isFocused ? 'text-black-800 dark:text-white' : 'text-metal'}`}
        font={{ family: 'ABCDiatype', weight: 'Medium' }}
      >
        {route}
        {counter > 0 && <Text className="text-xs"> {counter}</Text>}
      </Typography>
    </GalleryTouchableOpacity>
  );
}

type TabRoutes = {
  name: string;
  counter?: number;
};

type Props = {
  activeRoute: string;
  onRouteChange: (route: string) => void;
  routes: TabRoutes[];
} & GalleryElementTrackingProps;

export function GalleryTabBar({
  eventElementId,
  eventName,
  eventContext,
  eventFlow,
  routes,
  activeRoute,
  onRouteChange,
}: Props) {
  const Tabs = useMemo(() => {
    return routes.map((route) => {
      return (
        <TabItem
          key={route.name}
          route={route.name}
          onRouteChange={onRouteChange}
          activeRoute={activeRoute}
          counter={route.counter}
          eventElementId={eventElementId}
          eventName={eventName}
          eventContext={eventContext}
          eventFlow={eventFlow}
        />
      );
    });
  }, [activeRoute, eventContext, eventElementId, eventFlow, eventName, onRouteChange, routes]);
  return (
    <View className="border-porcelain dark:border-black-500 mt-4 flex flex-row items-center justify-center border-t border-b px-2 py-3">
      {/* ScrollView doesnt have a built in way to center the tabs if it doesnt overflow, so only use ScrollView if there are more than 4 tabs */}
      {routes.length > 4 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Tabs}
        </ScrollView>
      ) : (
        Tabs
      )}
    </View>
  );
}
