import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import { View } from 'react-native';

import { Button } from '~/components/Button';
import { GalleryLink } from '~/components/GalleryLink';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { Typography } from '~/components/Typography';
import { contexts } from '~/shared/analytics/constants';

const SNAP_POINTS = ['CONTENT_HEIGHT'];

type Props = {
  onClose: () => void;
};

export default function CreatorSupportAnnouncementBottomSheet({ onClose }: Props) {
  const { handleContentLayout } = useBottomSheetDynamicSnapPoints(SNAP_POINTS);

  const { bottom } = useSafeAreaPadding();

  return (
    <View
      onLayout={handleContentLayout}
      style={{ paddingBottom: bottom }}
      className="p-4 flex flex-col space-y-6"
    >
      <View className="flex flex-col space-y-3">
        <Typography
          className="text-5xl text-center -tracking-[2]"
          font={{ family: 'GTAlpina', weight: 'Light' }}
        >
          Gallery for Creators is now in beta
        </Typography>
        <Typography
          className="text-center text-sm leading-6"
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
        >
          Welcome to our new creator support feature, currently in beta. Share and display works
          you’ve created on Gallery. Learn more about how it works in{' '}
          <GalleryLink
            href="https://gallery-so.notion.site/Creator-FAQs-22b6a0cd877946efb06f25ce4a70cb5a"
            eventElementId={'Creator Support Announcement Bottom Sheet FAQ Link'}
            eventName={'Opened Creator Support Announcement Bottom Sheet FAQ Link'}
            eventContext={contexts.Posts}
          >
            our FAQ here
          </GalleryLink>
          .
        </Typography>
      </View>
      <Button
        text="Continue"
        onPress={onClose}
        eventElementId={'Creator Support Announcement Bottom Sheet Continue Button'}
        eventName={'Pressed Creator Support Announcement Bottom Sheet Continue Button'}
        eventContext={contexts.Posts}
      />
    </View>
  );
}
