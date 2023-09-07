import { View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import { GallerySkeleton } from '~/components/GallerySkeleton';
import { GalleryProfileNavbarFallback } from '~/components/ProfileView/GalleryProfileNavBar';

export function GalleryScreenFallback() {
  return (
    <View className="flex-1 bg-white dark:bg-black-900 px-4">
      <GalleryProfileNavbarFallback shouldShowBackButton />

      <GallerySkeleton>
        <SkeletonPlaceholder.Item>
          <SkeletonPlaceholder.Item marginTop={16} width="100%" height={28} marginBottom={8} />
          <SkeletonPlaceholder.Item width="80%" height={28} marginBottom={16} />

          <SkeletonPlaceholder.Item width="20%" height={20} marginBottom={8} />
          <SkeletonPlaceholder.Item width="40%" height={20} marginBottom={16} />

          <SkeletonPlaceholder.Item width="100%" height={100} marginBottom={48} />
          <SkeletonPlaceholder.Item width="100%" height={150} marginBottom={48} />
          <SkeletonPlaceholder.Item width="100%" height={175} marginBottom={48} />
          <SkeletonPlaceholder.Item width="100%" height={200} marginBottom={48} />
        </SkeletonPlaceholder.Item>
      </GallerySkeleton>
    </View>
  );
}
