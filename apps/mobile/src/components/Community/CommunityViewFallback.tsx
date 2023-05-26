import { View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import { GallerySkeleton } from '~/components/GallerySkeleton';
import { GalleryProfileNavbarFallback } from '~/components/ProfileView/GalleryProfileNavBar';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';

const TOTAL_ROWS = 20;

export function CommunityViewFallback() {
  const { top } = useSafeAreaPadding();

  return (
    <View className="flex-1 bg-white dark:bg-black px-4" style={{ paddingTop: top }}>
      <View className="mb-4">
        <GalleryProfileNavbarFallback shouldShowBackButton={true} />
      </View>

      <GallerySkeleton>
        <SkeletonPlaceholder.Item flexDirection="column" width="100%">
          <SkeletonPlaceholder.Item marginBottom={16} flexDirection="row">
            <SkeletonPlaceholder.Item width={200} height={32} />
          </SkeletonPlaceholder.Item>

          <SkeletonPlaceholder.Item flexDirection="column" gap={4} marginBottom={16}>
            <SkeletonPlaceholder.Item width="40%" height={12} />
            <SkeletonPlaceholder.Item width="40%" height={12} />
          </SkeletonPlaceholder.Item>

          <SkeletonPlaceholder.Item flexDirection="column" gap={4} marginBottom={16}>
            <SkeletonPlaceholder.Item width="50%" height={12} />
          </SkeletonPlaceholder.Item>
          {Array.from({ length: TOTAL_ROWS }).map((_, index) => (
            <SkeletonPlaceholder.Item key={index} flexDirection="row" gap={4} marginBottom={4}>
              <SkeletonPlaceholder.Item width="50%" height={30} />
              <SkeletonPlaceholder.Item width="50%" height={30} />
            </SkeletonPlaceholder.Item>
          ))}
        </SkeletonPlaceholder.Item>
      </GallerySkeleton>
    </View>
  );
}
