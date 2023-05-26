import { Suspense } from 'react';
import { View } from 'react-native';

import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';

import { LoadingNftDetailScreenInner } from './LoadingNftDetailScreenInner';
import { NftDetailScreenInner } from './NftDetailScreenInner';

export function NftDetailScreen() {
  const { top } = useSafeAreaPadding();

  return (
    <View style={{ paddingTop: top }} className="h-full bg-white dark:bg-black-900">
      <Suspense fallback={<LoadingNftDetailScreenInner />}>
        <NftDetailScreenInner />
      </Suspense>
    </View>
  );
}
