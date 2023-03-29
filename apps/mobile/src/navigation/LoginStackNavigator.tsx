import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginStackNavigatorParamList } from '~/navigation/types';

import { EnterEmailScreen } from '../screens/Login/EnterEmailScreen';
import { LandingScreen } from '../screens/Login/LandingScreen';
import { QRCodeScreen } from '../screens/Login/QRCodeScreen';

const Stack = createNativeStackNavigator<LoginStackNavigatorParamList>();

function Empty() {
  return null;
}

export function LoginStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ header: Empty }} initialRouteName="Landing">
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="EnterEmail" component={EnterEmailScreen} />

      <Stack.Screen name="QRCode" component={QRCodeScreen} />
    </Stack.Navigator>
  );
}
