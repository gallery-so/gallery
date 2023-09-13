import { Suspense } from 'react';
import { View } from 'react-native';

import { LoadingNftDetailScreenInner } from './LoadingNftDetailScreenInner';
import { NftDetailScreenInner } from './NftDetailScreenInner';

export function NftDetailScreen() {
  return (
    <View className="h-full bg-white dark:bg-black-900 pt-4">
      <Suspense fallback={<LoadingNftDetailScreenInner />}>
        <NftDetailScreenInner />
      </Suspense>
    </View>
  );
}
