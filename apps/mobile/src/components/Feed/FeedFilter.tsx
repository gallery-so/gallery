import { View } from 'react-native';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { Pill } from '../Pill';
import { Typography } from '../Typography';

export type ActiveFeed = 'Worldwide' | 'Following' | 'Profile' | 'Trending';

type Props = {
  activeFeed: ActiveFeed;
  onChange: (feed: ActiveFeed) => void;
};

export function FeedFilter({ activeFeed, onChange }: Props) {
  return (
    <View className="flex flex-row justify-center space-x-2 pt-5 pb-6">
      <GalleryTouchableOpacity
        onPress={() => onChange('Worldwide')}
        id="Feed Filter Button"
        eventName="Feed Filter Clicked"
        properties={{ variant: 'Worldwide' }}
      >
        <Pill
          className="flex flex-row items-center space-x-2 self-start"
          active={activeFeed === 'Worldwide'}
        >
          <Typography
            font={{ family: 'ABCDiatype', weight: 'Bold' }}
            className="text-sm text-center"
          >
            Worldwide
          </Typography>
        </Pill>
      </GalleryTouchableOpacity>
      <GalleryTouchableOpacity
        onPress={() => onChange('Following')}
        id="Feed Filter Button"
        eventName="Feed Filter Clicked"
        properties={{ variant: 'Following' }}
      >
        <Pill
          className="flex flex-row items-center space-x-2 self-start"
          active={activeFeed === 'Following'}
        >
          <Typography
            font={{ family: 'ABCDiatype', weight: 'Bold' }}
            className="text-sm text-center"
          >
            Following
          </Typography>
        </Pill>
      </GalleryTouchableOpacity>
    </View>
  );
}
