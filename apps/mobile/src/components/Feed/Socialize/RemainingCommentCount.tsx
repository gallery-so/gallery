import { ViewProps } from 'react-native';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { Typography } from '~/components/Typography';
import { contexts } from '~/shared/analytics/constants';

type Props = {
  totalCount: number;
  onPress: () => void;
  style?: ViewProps['style'];
};

export function RemainingCommentCount({ style, onPress, totalCount }: Props) {
  if (totalCount === 0) {
    return null;
  }

  return (
    <GalleryTouchableOpacity
      style={style}
      onPress={onPress}
      eventElementId="Expand Admirers Button"
      eventName="Expand Admirers Button Clicked"
      eventContext={contexts.Posts}
    >
      <Typography
        className="text-sm color-shadow"
        font={{ family: 'ABCDiatype', weight: 'Regular' }}
      >
        View all {totalCount} comments
      </Typography>
    </GalleryTouchableOpacity>
  );
}
