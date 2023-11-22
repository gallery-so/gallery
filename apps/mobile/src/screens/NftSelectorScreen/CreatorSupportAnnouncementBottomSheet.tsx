import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import { ForwardedRef, forwardRef, useCallback, useRef } from 'react';
import { View } from 'react-native';

import { Button } from '~/components/Button';
import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryLink } from '~/components/GalleryLink';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { Typography } from '~/components/Typography';

const SNAP_POINTS = ['CONTENT_HEIGHT'];

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = {};

function CreatorSupportAnnouncementBottomSheet(
  {}: Props,
  ref: ForwardedRef<GalleryBottomSheetModalType>
) {
  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);
  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(SNAP_POINTS);

  const handleContinuePress = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);
  const { bottom } = useSafeAreaPadding();

  return (
    <GalleryBottomSheetModal
      ref={(value) => {
        bottomSheetRef.current = value;

        if (typeof ref === 'function') {
          ref(value);
        } else if (ref) {
          ref.current = value;
        }
      }}
      snapPoints={animatedSnapPoints}
      handleHeight={animatedHandleHeight}
      contentHeight={animatedContentHeight}
    >
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
            className="text-center text-sm leading-5"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            Welcome to our new creator support feature, currently in beta. Share and display works
            you’ve created on Gallery. Learn more about how it works in{' '}
            <GalleryLink
              href="https://gallery-so.notion.site/Creator-FAQs-22b6a0cd877946efb06f25ce4a70cb5a"
              eventElementId={null}
              eventName={null}
              eventContext={null}
            >
              our FAQ here
            </GalleryLink>
            .
          </Typography>
        </View>
        <Button
          text="Continue"
          onPress={handleContinuePress}
          eventElementId={null}
          eventName={null}
          eventContext={null}
        />
      </View>
    </GalleryBottomSheetModal>
  );
}

const ForwardedCreatorSupportAnnouncementBottomSheet = forwardRef(
  CreatorSupportAnnouncementBottomSheet
);

export { ForwardedCreatorSupportAnnouncementBottomSheet as CreatorSupportAnnouncementBottomSheet };
