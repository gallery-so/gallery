import { View } from 'react-native';

import { GLogoIcon } from '../icons/GLogoIcon';

export function LoadingView() {
  return (
    <View className="flex h-full w-full items-center justify-center bg-white dark:bg-black-900">
      <GLogoIcon />
    </View>
  );
}
