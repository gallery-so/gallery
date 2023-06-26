import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MainTabStackNavigatorParamList } from '~/navigation/types';
import { CollectionScreen } from '~/screens/CollectionScreen/CollectionScreen';
import { CommunityScreen } from '~/screens/CommunityScreen/CommunityScreen';
import { FeedEventScreen } from '~/screens/FeedEventScreen';
import { GalleryScreen } from '~/screens/GalleryScreen/GalleryScreen';
import { HomeScreen } from '~/screens/HomeScreen/HomeScreen';
import { NftDetailScreen } from '~/screens/NftDetailScreen/NftDetailScreen';
import { NotificationsScreen } from '~/screens/NotificationsScreen';
import { ProfilePicturePickerContractScreen } from '~/screens/ProfilePicturePickerScreen/ProfilePicturePickerContractScreen';
import { ProfilePicturePickerScreen } from '~/screens/ProfilePicturePickerScreen/ProfilePicturePickerScreen';
import { ProfileScreen } from '~/screens/ProfileScreen/ProfileScreen';
import { SearchScreen } from '~/screens/SearchScreen';
import { SettingsScreen } from '~/screens/SettingsScreen/SettingsScreen';

const Stack = createNativeStackNavigator<MainTabStackNavigatorParamList>();

type Props = {
  initialProfileParams?: MainTabStackNavigatorParamList['Profile'];
  initialRouteName: keyof MainTabStackNavigatorParamList;
};

export function MainTabStackNavigator({ initialRouteName, initialProfileParams }: Props) {
  return (
    <Stack.Navigator initialRouteName="ProfilePicturePicker" screenOptions={{ header: Empty }}>
      <Stack.Screen name="NftDetail" component={NftDetailScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} initialParams={initialProfileParams} />
      <Stack.Screen name="Gallery" component={GalleryScreen} />
      <Stack.Screen name="Collection" component={CollectionScreen} />
      <Stack.Screen name="FeedEvent" component={FeedEventScreen} />
      <Stack.Screen name="Community" component={CommunityScreen} />
      <Stack.Screen name="ProfilePicturePicker" component={ProfilePicturePickerScreen} />
      <Stack.Screen
        name="ProfilePicturePickerContract"
        component={ProfilePicturePickerContractScreen}
      />

      {/* The 5 main tabs excluding "Account" since that just uses Profile */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      {/* End the 4 main tabs */}
    </Stack.Navigator>
  );
}

function Empty() {
  return null;
}
