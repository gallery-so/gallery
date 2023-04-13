import { View, ViewProps } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import { GallerySkeleton } from '../GallerySkeleton';

type LoadingNotificationListItemProps = {
  style?: ViewProps['style'];
};

export function LoadingNotificationListItem({ style }: LoadingNotificationListItemProps) {
  return (
    <View style={style} className="py-3">
      <GallerySkeleton>
        <SkeletonPlaceholder.Item flexDirection="row" justifyContent="space-between" gap={8}>
          <SkeletonPlaceholder.Item
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            width="60%"
            height={20}
          />
          <SkeletonPlaceholder.Item width="10%" height={20} />
        </SkeletonPlaceholder.Item>
      </GallerySkeleton>
    </View>
  );
}
