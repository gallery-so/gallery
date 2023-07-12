import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { PostStackNavigatorParamList } from '~/navigation/types';
import { PostScreen } from '~/screens/PostScreen/PostScreen';
import { ProfilePicturePickerScreen } from '~/screens/ProfilePicturePickerScreen/ProfilePicturePickerScreen';

const Stack = createNativeStackNavigator<PostStackNavigatorParamList>();

function Empty() {
  return null;
}

export function PostStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ header: Empty }} initialRouteName="NftSelector">
      <Stack.Screen
        name="NftSelector"
        component={ProfilePicturePickerScreen}
        initialParams={{
          page: 'Post',
        }}
      />
      <Stack.Screen name="PostComposer" component={PostScreen} />
    </Stack.Navigator>
  );
}
