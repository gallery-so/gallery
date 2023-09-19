import { Suspense } from 'react';
import { View } from 'react-native';

import { LoadingNftDetailScreenInner } from './LoadingNftDetailScreenInner';
import { UniversalNftDetailScreenInner } from './UniversalNftDetailScreenInner';

export function UniversalNftDetailScreen() {
  return (
    <View className="h-full bg-white dark:bg-black-900">
      <Suspense fallback={<LoadingNftDetailScreenInner />}>
        <UniversalNftDetailScreenInner />
      </Suspense>
    </View>
  );
}
