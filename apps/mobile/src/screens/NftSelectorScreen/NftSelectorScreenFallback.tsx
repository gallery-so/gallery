import { useWindowDimensions, View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import { GallerySkeleton } from '~/components/GallerySkeleton';

const TOTAL = 15;

export function NftSelectorScreenFallback() {
  const dimensions = useWindowDimensions();

  //   Full width of the screen minus the gap between the images and padding
  const size = (dimensions.width - 32 - 32) / 3;

  return (
    <View className="flex-1 bg-white dark:bg-black px-4 pt-4">
      <GallerySkeleton>
        <SkeletonPlaceholder.Item flexDirection="column" width="100%">
          <SkeletonPlaceholder.Item
            flexDirection="row"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={16}
          >
            {Array.from({ length: TOTAL }).map((_, index) => (
              <SkeletonPlaceholder.Item
                key={index}
                flexDirection="column"
                width={size}
                height={size}
              >
                <SkeletonPlaceholder.Item width="100%" height={110} />
              </SkeletonPlaceholder.Item>
            ))}
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>
      </GallerySkeleton>
    </View>
  );
}
