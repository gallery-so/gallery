import { Suspense } from 'react';

import { SafeAreaViewWithPadding } from '~/components/SafeAreaViewWithPadding';

import { LoadingNftDetailScreenInner } from './LoadingNftDetailScreenInner';
import { NftDetailScreenInner } from './NftDetailScreenInner';

export function NftDetailScreen() {
  return (
    <SafeAreaViewWithPadding className="h-full bg-white dark:bg-black">
      <Suspense fallback={<LoadingNftDetailScreenInner />}>
        <NftDetailScreenInner />
      </Suspense>
    </SafeAreaViewWithPadding>
  );
}
