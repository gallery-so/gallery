import { View } from 'react-native';

import { ErrorIcon } from '../../icons/ErrorIcon';

export function NftPreviewErrorFallback() {
  return (
    <View className="w-full h-full bg-offWhite dark:bg-offBlack flex items-center justify-center">
      <ErrorIcon />
    </View>
  );
}
