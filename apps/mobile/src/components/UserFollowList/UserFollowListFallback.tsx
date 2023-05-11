import { View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import { GallerySkeleton } from '~/components/GallerySkeleton';

// 20 18 24
export function UserFollowCardFallback() {
  return (
    <View className="px-4 py-3">
      <GallerySkeleton>
        <SkeletonPlaceholder.Item
          alignItems="center"
          flexDirection="row"
          justifyContent="space-between"
        >
          <SkeletonPlaceholder.Item flexDirection="column" rowGap={4}>
            <SkeletonPlaceholder.Item width={50} height={20} />
            <SkeletonPlaceholder.Item width={100} height={18} />
          </SkeletonPlaceholder.Item>

          <SkeletonPlaceholder.Item width={100} height={24} />
        </SkeletonPlaceholder.Item>
      </GallerySkeleton>
    </View>
  );
}

export function UserFollowListFallback() {
  return (
    <View className="flex flex-col">
      <UserFollowCardFallback />
      <UserFollowCardFallback />
      <UserFollowCardFallback />
    </View>
  );
}
