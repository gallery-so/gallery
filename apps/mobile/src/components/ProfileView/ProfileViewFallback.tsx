import { View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import { GallerySkeleton } from '~/components/GallerySkeleton';
import { GalleryProfileNavbarFallback } from '~/components/ProfileView/GalleryProfileNavBar';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';

export function ProfileViewFallback() {
  const { top } = useSafeAreaPadding();

  return (
    <View className="flex-1 bg-white dark:bg-black px-4" style={{ paddingTop: top }}>
      <GalleryProfileNavbarFallback shouldShowBackButton={true} />

      <GallerySkeleton>
        <SkeletonPlaceholder.Item flexDirection="column" width="100%">
          <SkeletonPlaceholder.Item marginBottom={16} flexDirection="row" justifyContent="center">
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
