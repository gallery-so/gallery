import { View } from 'react-native';

import { ErrorIcon } from '../../icons/ErrorIcon';

export function NftPreviewErrorFallback() {
  return (
    <View className="w-full h-full bg-porcelain dark:bg-black-800 flex items-center justify-center">
      <ErrorIcon />
    </View>
  );
}
