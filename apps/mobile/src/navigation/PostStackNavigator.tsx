import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { PostStackNavigatorParamList } from '~/navigation/types';
import { NftSelectorPickerScreen } from '~/screens/NftSelectorScreen/NftSelectorPickerScreen';
import { PostComposerScreen } from '~/screens/PostScreen/PostComposerScreen';

const Stack = createNativeStackNavigator<PostStackNavigatorParamList>();

function Empty() {
  return null;
}

export function PostStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ header: Empty }} initialRouteName="NftSelector">
      <Stack.Screen
        name="NftSelector"
        component={NftSelectorPickerScreen}
        initialParams={{
          page: 'Post',
        }}
      />
      <Stack.Screen name="PostComposer" component={PostComposerScreen} />
    </Stack.Navigator>
  );
}
