import { useWindowDimensions, View, ViewProps } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import { GallerySkeleton } from '../GallerySkeleton';

type LoadingFeedListItemProps = {
  style: ViewProps['style'];
};
export function LoadingFeedListItem({ style }: LoadingFeedListItemProps) {
  const { width } = useWindowDimensions();

  const PADDING_HORIZONTAL = 12;
  const CAROUSEL_WIDTH = width - PADDING_HORIZONTAL * 2;

  return (
    <View style={style}>
      <GallerySkeleton>
        <SkeletonPlaceholder.Item flexDirection="column" paddingHorizontal={12} gap={8}>
          <SkeletonPlaceholder.Item
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <SkeletonPlaceholder.Item width="60%" height={16} />

            <SkeletonPlaceholder.Item width={16} height={16} />
          </SkeletonPlaceholder.Item>
          <SkeletonPlaceholder.Item width="70%" height={16} />

          <SkeletonPlaceholder.Item width={CAROUSEL_WIDTH} height={CAROUSEL_WIDTH} />
        </SkeletonPlaceholder.Item>
      </GallerySkeleton>
    </View>
  );
}
