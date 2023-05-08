import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MainTabStackNavigatorParamList } from '~/navigation/types';
import { AccountScreen } from '~/screens/AccountScreen';
import { CollectionScreen } from '~/screens/CollectionScreen/CollectionScreen';
import { GalleryScreen } from '~/screens/GalleryScreen/GalleryScreen';
import { HomeScreen } from '~/screens/HomeScreen/HomeScreen';
import { NftDetailScreen } from '~/screens/NftDetailScreen/NftDetailScreen';
import { NotificationsScreen } from '~/screens/NotificationsScreen';
import { ProfileScreen } from '~/screens/ProfileScreen/ProfileScreen';
import { SearchScreen } from '~/screens/SearchScreen';

const Stack = createNativeStackNavigator<MainTabStackNavigatorParamList>();

type Props = {
  initialRouteName: keyof MainTabStackNavigatorParamList;
};

export function MainTabStackNavigator({ initialRouteName }: Props) {
  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ header: Empty }}>
      <Stack.Screen name="NftDetail" component={NftDetailScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Gallery" component={GalleryScreen} />
      <Stack.Screen name="Collection" component={CollectionScreen} />

      {/* The 4 main tabs */}
      <Stack.Screen name="Account" component={AccountScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      {/* End the 4 main tabs */}
    </Stack.Navigator>
  );
}

function Empty() {
  return null;
}
