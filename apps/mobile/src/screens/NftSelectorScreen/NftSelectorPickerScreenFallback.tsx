import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import { BackButton } from '~/components/BackButton';
import { GallerySkeleton } from '~/components/GallerySkeleton';

import { NftSelectorScreenFallback } from './NftSelectorScreenFallback';

export function NftSelectorPickerScreenFallback() {
  const { top } = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-white dark:bg-black-900"
      style={{
        paddingTop: top,
      }}
    >
      <View className="px-4 relative">
        <View className="absolute left-4 z-10">
          <BackButton />
        </View>

        <GallerySkeleton>
          <SkeletonPlaceholder.Item gap={32}>
            {/* <SkeletonPlaceholder.Item alignItems="center" justifyContent="center" height={32}>
              <SkeletonPlaceholder.Item width={140} height={16} paddingTop={8} />
            </SkeletonPlaceholder.Item> */}
            <SkeletonPlaceholder.Item gap={16} paddingTop={64}>
              <SkeletonPlaceholder.Item width="100%" height={36} borderRadius={2} />

              <SkeletonPlaceholder.Item flexDirection="row" justifyContent="space-between">
                <SkeletonPlaceholder.Item width={128} height={24} borderRadius={2} />

                <SkeletonPlaceholder.Item flexDirection="row" gap={4}>
                  <SkeletonPlaceholder.Item width={24} height={24} borderRadius={80} />

                  <SkeletonPlaceholder.Item width={24} height={24} borderRadius={80} />
                </SkeletonPlaceholder.Item>
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>
        </GallerySkeleton>
      </View>
      <NftSelectorScreenFallback />
    </View>
  );
}
