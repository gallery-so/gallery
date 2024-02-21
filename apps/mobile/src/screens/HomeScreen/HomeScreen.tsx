import { View } from 'react-native';

import { FeedTabNavigator } from '~/navigation/FeedTabNavigator/FeedTabNavigator';

export function HomeScreen() {
  return (
    <View className="flex-1 bg-white dark:bg-black-900">
      <FeedTabNavigator />
    </View>
  );
}
