import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { PostStackNavigatorParamList } from '~/navigation/types';
import { PostComposerScreen } from '~/screens/PostScreen/PostComposerScreen';
import { PostNftSelectorScreen } from '~/screens/PostScreen/PostNftSelectorScreen';

const Stack = createNativeStackNavigator<PostStackNavigatorParamList>();

function Empty() {
  return null;
}

export function PostStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ header: Empty }} initialRouteName="NftSelector">
      <Stack.Screen
        name="NftSelector"
        component={PostNftSelectorScreen}
        initialParams={{
          page: 'Post',
        }}
      />
      <Stack.Screen name="PostComposer" component={PostComposerScreen} />
    </Stack.Navigator>
  );
}
