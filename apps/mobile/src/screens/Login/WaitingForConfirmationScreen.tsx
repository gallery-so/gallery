import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { View } from 'react-native';

import { LoginStackNavigatorParamList, LoginStackNavigatorProp } from '~/navigation/types';

import { IconContainer } from '../../components/IconContainer';
import { SafeAreaViewWithPadding } from '../../components/SafeAreaViewWithPadding';
import { Typography } from '../../components/Typography';
import { BackIcon } from '../../icons/BackIcon';

export function WaitingForConfirmationScreen() {
  const route = useRoute<RouteProp<LoginStackNavigatorParamList, 'WaitingForConfirmation'>>();
  const navigation = useNavigation<LoginStackNavigatorProp>();

  return (
    <SafeAreaViewWithPadding className="flex h-screen flex-1 flex-col bg-white">
      <IconContainer className="px-6" icon={<BackIcon />} onPress={navigation.goBack} />

      <View className="flex flex-grow flex-col items-center justify-center">
        <View className="flex max-w-xs flex-col space-y-4">
          <Typography className="text-lg" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            Almost there!
          </Typography>

          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
            We sent a magic link to{' '}
            <Typography font={{ family: 'ABCDiatype', weight: 'Bold' }}>
              {route.params.email}
            </Typography>
            . Open the link on any device and you'll be signed in here.
          </Typography>

          <View />
        </View>
      </View>
    </SafeAreaViewWithPadding>
  );
}
