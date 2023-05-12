import { View } from 'react-native';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { Typography } from '../Typography';
import { NUM_PREVIEW_SEARCH_RESULTS } from './constants';

type Props = {
  title: string;
  onShowAll: () => void;
  isShowAll?: boolean;
  numResults: number;
};

export function SearchSection({ isShowAll, numResults, onShowAll, title }: Props) {
  if (!isShowAll && numResults === 0) return null;

  return (
    <View className="flex flex-row items-center justify-between p-4">
      <Typography
        font={{
          family: 'ABCDiatype',
          weight: 'Medium',
        }}
        className="text-metal text-xs uppercase"
      >
        {title}
      </Typography>

      {!isShowAll && numResults > NUM_PREVIEW_SEARCH_RESULTS && (
        <GalleryTouchableOpacity onPress={onShowAll}>
          <Typography
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
            className="border-b border-black text-sm"
          >
            Show all
          </Typography>
        </GalleryTouchableOpacity>
      )}
    </View>
  );
}
