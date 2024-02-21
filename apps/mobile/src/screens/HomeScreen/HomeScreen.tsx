import { View } from 'react-native';

import { WelcomeNewUserOnboarding } from '~/components/WelcomeNewUserOnboarding';
import { useWelcomeNewUserActions } from '~/contexts/WelcomeNewUserContext';
import { FeedTabNavigator } from '~/navigation/FeedTabNavigator/FeedTabNavigator';

export function HomeScreen() {
  const { username, isWelcomingNewUser } = useWelcomeNewUserActions();

  return (
    <View className="flex-1 bg-white dark:bg-black-900">
      {isWelcomingNewUser && <WelcomeNewUserOnboarding username={username} />}
      <FeedTabNavigator />
    </View>
  );
}
