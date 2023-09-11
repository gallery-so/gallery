import { View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import { GallerySkeleton } from '~/components/GallerySkeleton';
import { GalleryProfileNavbarFallback } from '~/components/ProfileView/GalleryProfileNavBar';

import { CommunityPostListFallback } from './CommunityPostListFallback';

export function CommunityViewFallback() {
  return (
    <View className="flex-1 bg-white dark:bg-black px-4 pt-4">
      <View className="mb-4">
        <GalleryProfileNavbarFallback shouldShowBackButton={true} />
      </View>

      <GallerySkeleton>
        <SkeletonPlaceholder.Item flexDirection="column" width="100%">
          <SkeletonPlaceholder.Item marginBottom={16} flexDirection="row" gap={8}>
            <SkeletonPlaceholder.Item width={72} height={72} borderRadius={200} />

            <SkeletonPlaceholder.Item marginBottom={16} flexDirection="column" gap={8}>
              <SkeletonPlaceholder.Item width={200} height={32} />
              <SkeletonPlaceholder.Item width={200} height={16} />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>

          <SkeletonPlaceholder.Item
            marginBottom={16}
            flexDirection="row"
            justifyContent="space-between"
            gap={8}
          >
            <SkeletonPlaceholder.Item marginBottom={16} flexDirection="column" gap={8}>
              <SkeletonPlaceholder.Item width={100} height={8} />
              <SkeletonPlaceholder.Item width={100} height={8} />
            </SkeletonPlaceholder.Item>
            <SkeletonPlaceholder.Item marginBottom={16} flexDirection="column" gap={8}>
              <SkeletonPlaceholder.Item width={100} height={8} />
              <SkeletonPlaceholder.Item width={100} height={8} />
            </SkeletonPlaceholder.Item>
            <SkeletonPlaceholder.Item marginBottom={16} flexDirection="column" gap={8}>
              <SkeletonPlaceholder.Item width={100} height={8} />
              <SkeletonPlaceholder.Item width={100} height={8} />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>

          <SkeletonPlaceholder.Item
            flexDirection="row"
            gap={20}
            alignItems="center"
            justifyContent="center"
            marginBottom={32}
            marginTop={16}
          >
            <SkeletonPlaceholder.Item width="25%" height={16} />
            <SkeletonPlaceholder.Item width="25%" height={16} />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>
      </GallerySkeleton>

      <View className="-mx-4">
        <CommunityPostListFallback />
      </View>
    </View>
  );
}
