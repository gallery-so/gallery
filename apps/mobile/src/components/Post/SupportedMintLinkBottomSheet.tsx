import { useCallback } from 'react';
import { Linking, View } from 'react-native';

import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { contexts } from '~/shared/analytics/constants';

import { Button } from '../Button';
import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { Typography } from '../Typography';

export default function SupportedMintLinkBottomSheet() {
  const handlePress = useCallback(() => {
    Linking.openURL(
      'https://gallery-so.notion.site/Supported-Mint-Link-Domains-b4420f096413498d8aa24d857561817b'
    );
  }, []);

  const { hideBottomSheetModal } = useBottomSheetModalActions();

  return (
    <View className="flex flex-col space-y-6">
      <View className="flex flex-col space-y-4">
        <Typography
          className="text-lg text-black-900 dark:text-offWhite"
          font={{ family: 'ABCDiatype', weight: 'Bold' }}
        >
          Mint links
        </Typography>
        <Typography
          className="text-lg text-black-900 dark:text-offWhite"
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
        >
          Gallery automatically adds your primary wallet address in mint links, ensuring you get
          100% of referral rewards on supported platforms.
        </Typography>
        <Typography
          className="text-lg text-black-900 dark:text-offWhite"
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
        >
          View our supported platforms{' '}
          <GalleryTouchableOpacity
            onPress={handlePress}
            eventElementId="Supported Mint Link Bottom Sheet"
            eventName="Press Supported Mint Link Bottom Sheet"
            eventContext={contexts.Posts}
            withoutFeedback
          >
            <Typography
              className="text-lg text-black-900 dark:text-offWhite"
              font={{ family: 'ABCDiatype', weight: 'Bold' }}
            >
              here
            </Typography>
          </GalleryTouchableOpacity>
          .
        </Typography>
      </View>

      <Button
        onPress={hideBottomSheetModal}
        text="close"
        eventElementId="Close Supported Mint Link Bottom Sheet"
        eventName="Close Supported Mint Link Bottom Sheet"
        eventContext={contexts.Posts}
      />
    </View>
  );
}
