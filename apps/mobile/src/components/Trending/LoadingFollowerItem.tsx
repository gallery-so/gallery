import { View, ViewProps } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import { GallerySkeleton } from '../GallerySkeleton';

type LoadingFollowerItemProps = {
  style?: ViewProps['style'];
};
export function LoadingFollowerItem({ style }: LoadingFollowerItemProps) {
  const CARD_HEIGHT = 20;

  return (
    <View style={style}>
      <GallerySkeleton>
        <SkeletonPlaceholder.Item
          flexDirection="column"
          justifyContent="space-between"
          paddingVertical={12}
          gap={8}
        >
          <SkeletonPlaceholder.Item flexDirection="row" justifyContent="space-between" gap={8}>
            <SkeletonPlaceholder.Item width="20%" height={CARD_HEIGHT} />
            <SkeletonPlaceholder.Item width="20%" height={CARD_HEIGHT} />
          </SkeletonPlaceholder.Item>
          <SkeletonPlaceholder.Item width="40%" height={CARD_HEIGHT} />
        </SkeletonPlaceholder.Item>
      </GallerySkeleton>
    </View>
  );
}
