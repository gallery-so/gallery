import { View, ViewProps } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import { GallerySkeleton } from '../GallerySkeleton';

type LoadingTrendingItemProps = {
  style?: ViewProps['style'];
};
export function LoadingTrendingItem({ style }: LoadingTrendingItemProps) {
  const CARD_HEIGHT = 180;

  return (
    <View style={style}>
      <GallerySkeleton>
        <SkeletonPlaceholder.Item flexDirection="column" paddingHorizontal={0} gap={8}>
          <SkeletonPlaceholder.Item width="40%" height={28} />

          <SkeletonPlaceholder.Item
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <SkeletonPlaceholder.Item width="70%" height={16} />

            <SkeletonPlaceholder.Item width={36} height={16} />
          </SkeletonPlaceholder.Item>

          <SkeletonPlaceholder.Item
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            gap={12}
          >
            <SkeletonPlaceholder.Item width="50%" height={CARD_HEIGHT} />
            <SkeletonPlaceholder.Item width="50%" height={CARD_HEIGHT} />
          </SkeletonPlaceholder.Item>

          <SkeletonPlaceholder.Item
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            gap={12}
            marginBottom={12}
          >
            <SkeletonPlaceholder.Item width="50%" height={CARD_HEIGHT} />
            <SkeletonPlaceholder.Item width="50%" height={CARD_HEIGHT} />
          </SkeletonPlaceholder.Item>

          <SkeletonPlaceholder.Item flexDirection="row" alignItems="center" justifyContent="center">
            <SkeletonPlaceholder.Item width="20%" height={4} alignSelf="center" />
          </SkeletonPlaceholder.Item>
        </SkeletonPlaceholder.Item>
      </GallerySkeleton>
    </View>
  );
}
