import { View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import { GallerySkeleton } from '~/components/GallerySkeleton';

export function PostComposerNftFallback() {
  return (
    <View className="flex-1 bg-white dark:bg-black">
      <GallerySkeleton>
        <SkeletonPlaceholder.Item flexDirection="column" width="100%">
          <SkeletonPlaceholder.Item marginBottom={16} width="100%" height={330} />
          <SkeletonPlaceholder.Item flexDirection="column" rowGap={16}>
            <SkeletonPlaceholder.Item width={100} height={18} />
            <SkeletonPlaceholder.Item width={100} height={18} />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>
      </GallerySkeleton>
    </View>
  );
}
