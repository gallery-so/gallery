import { PropsWithChildren } from 'react';
import { View } from 'react-native';

import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';

type Props = {
  isFullscreen?: boolean;
} & PropsWithChildren;

export function NftSelectorContractWrapper({ isFullscreen, children }: Props) {
  const { top } = useSafeAreaPadding();

  return (
    <View
      className="flex-1 bg-white dark:bg-black-900"
      style={{
        paddingTop: isFullscreen ? top : 16,
      }}
    >
      <View className="flex flex-col space-y-8 flex-1">{children}</View>
    </View>
  );
}
