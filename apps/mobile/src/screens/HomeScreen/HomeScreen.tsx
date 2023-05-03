import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FeedTabNavigator } from '~/navigation/FeedTabNavigator/FeedTabNavigator';

export function HomeScreen() {
  const { top } = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: top }}>
      <FeedTabNavigator />
    </View>
  );
}
