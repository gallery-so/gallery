import { View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import { BackButton } from '~/components/BackButton';
import { GallerySkeleton } from '~/components/GallerySkeleton';

export function LoadingNftDetailScreenInner() {
  return (
    <View className="flex flex-col space-y-3 px-4">
      <View className="flex flex-row justify-between">
        <BackButton />
      </View>
      <View>
        <GallerySkeleton>
          <SkeletonPlaceholder.Item flexDirection="column" gap={16}>
            <SkeletonPlaceholder.Item width="100%" aspectRatio="1" />
            <SkeletonPlaceholder.Item flexDirection="column" gap={8} height="100%">
              <SkeletonPlaceholder.Item width="60%" height={36} />
              <SkeletonPlaceholder.Item width="80%" height={20} />
              <SkeletonPlaceholder.Item width="80%" height={20} />
              <SkeletonPlaceholder.Item width="80%" height={20} />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>
        </GallerySkeleton>
      </View>
    </View>
  );
}
