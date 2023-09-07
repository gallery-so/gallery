import { View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import { GallerySkeleton } from '~/components/GallerySkeleton';
import { GalleryProfileNavbarFallback } from '~/components/ProfileView/GalleryProfileNavBar';

type Props = {
  shouldShowBackButton: boolean;
};

export function ProfileViewFallback({ shouldShowBackButton }: Props) {
  return (
    <View className="flex-1 bg-white dark:bg-black-900 px-4">
      <GalleryProfileNavbarFallback shouldShowBackButton={shouldShowBackButton} />

      <GallerySkeleton>
        <SkeletonPlaceholder.Item flexDirection="column" width="100%" paddingTop={16}>
          <SkeletonPlaceholder.Item marginBottom={16} flexDirection="row">
            <SkeletonPlaceholder.Item width={100} height={32} />
          </SkeletonPlaceholder.Item>

          <SkeletonPlaceholder.Item flexDirection="column" gap={4}>
            <SkeletonPlaceholder.Item width="60%" height={12} />
            <SkeletonPlaceholder.Item width="70%" height={12} />
            <SkeletonPlaceholder.Item width="80%" height={12} />
          </SkeletonPlaceholder.Item>

          <SkeletonPlaceholder.Item
            marginBottom={16}
            marginTop={32}
            width="100%"
            height={50}
            borderRadius={0}
          />

          <SkeletonPlaceholder.Item marginVertical={12} width="100%" height={300} />
          <SkeletonPlaceholder.Item marginVertical={12} width="100%" height={300} />
          <SkeletonPlaceholder.Item marginVertical={12} width="100%" height={300} />
        </SkeletonPlaceholder.Item>
      </GallerySkeleton>
    </View>
  );
}
