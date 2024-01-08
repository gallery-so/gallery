import { View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import { GallerySkeleton } from '~/components/GallerySkeleton';

export function CommentCardFallback() {
  return (
    <View className="px-4 py-3">
      <GallerySkeleton>
        <SkeletonPlaceholder.Item
          alignItems="center"
          justifyContent="space-between"
          flexDirection="row"
          gap={4}
        >
          <SkeletonPlaceholder.Item alignItems="center" flexDirection="row" gap={4}>
            <SkeletonPlaceholder.Item width={24} height={24} borderRadius={80} />
            <SkeletonPlaceholder.Item flexDirection="column" rowGap={4}>
              <SkeletonPlaceholder.Item width={50} height={12} />
              <SkeletonPlaceholder.Item width={140} height={10} />
              <SkeletonPlaceholder.Item width={20} height={6} />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>
          <SkeletonPlaceholder.Item width={16} height={16} />
        </SkeletonPlaceholder.Item>
      </GallerySkeleton>
    </View>
  );
}

export function CommentListFallback() {
  return (
    <View className="flex flex-col space-y-1">
      <CommentCardFallback />
      <CommentCardFallback />
      <CommentCardFallback />
      <CommentCardFallback />
      <CommentCardFallback />
      <CommentCardFallback />
      <CommentCardFallback />
    </View>
  );
}
