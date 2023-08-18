import { ViewProps } from 'react-native';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { Typography } from '~/components/Typography';

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
    <>
      <GalleryTouchableOpacity
        style={style}
        onPress={onPress}
        eventElementId="Expand Admirers Button"
        eventName="Expand Admirers Button Clicked"
      >
        <Typography
          className="text-xs  color-shadow"
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
        >
          View all {totalCount} comments
        </Typography>
      </GalleryTouchableOpacity>
    </>
  );
}
