import { View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import { GallerySkeleton } from '~/components/GallerySkeleton';

// 36 14 440
export function CommunityPostCardFallback() {
  return (
    <View className="px-4 py-3">
      <GallerySkeleton>
        <SkeletonPlaceholder.Item flexDirection="column" width="100%" paddingTop={16}>
          <SkeletonPlaceholder.Item
            alignItems="center"
            flexDirection="row"
            justifyContent="space-between"
          >
            <SkeletonPlaceholder.Item flexDirection="row" gap={8}>
              <SkeletonPlaceholder.Item width={36} height={36} borderRadius={100} />
              <SkeletonPlaceholder.Item flexDirection="column" rowGap={4}>
                <SkeletonPlaceholder.Item width={100} height={16} />
                <SkeletonPlaceholder.Item width={100} height={12} />
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>
            <SkeletonPlaceholder.Item width={50} height={12} />
          </SkeletonPlaceholder.Item>
          <SkeletonPlaceholder.Item marginTop={18} width={100} height={14} />
          <SkeletonPlaceholder.Item marginVertical={18} width="100%" height={330} />
        </SkeletonPlaceholder.Item>
      </GallerySkeleton>
    </View>
  );
}

export function CommunityPostListFallback() {
  return (
    <View className="flex flex-col">
      <CommunityPostCardFallback />
    </View>
  );
}
