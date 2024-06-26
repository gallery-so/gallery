import { useNavigation } from '@react-navigation/native';
import { ResizeMode } from 'expo-av';
import { useColorScheme } from 'nativewind';
import { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { contexts } from 'shared/analytics/constants';
import colors from 'shared/theme/colors';
import { XMarkIcon } from 'src/icons/XMarkIcon';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import MintCampaignBottomSheet from '~/components/Mint/MintCampaign/MintCampaignBottomSheet';
import { BaseM } from '~/components/Text';
import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { useSanityAnnouncementContext } from '~/contexts/SanityAnnouncementContext';
import { MainTabStackNavigatorProp } from '~/navigation/types';

// Displays announcement content from Sanity
export default function AnnouncementNotification() {
  const { announcement, markAnnouncementAsSeen, dismissAnnouncement } =
    useSanityAnnouncementContext();
  const { showBottomSheetModal } = useBottomSheetModalActions();
  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const handlePress = useCallback(() => {
    if (!announcement) return;
    showBottomSheetModal({
      content: <MintCampaignBottomSheet projectInternalId={announcement.internal_id} />,
      navigationContext: navigation,
    });
  }, [announcement, navigation, showBottomSheetModal]);

  const handleDismissPress = useCallback(() => {
    dismissAnnouncement();
  }, [dismissAnnouncement]);

  useEffect(() => {
    markAnnouncementAsSeen();
    // Only run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { colorScheme } = useColorScheme();

  if (!announcement) {
    return null;
  }

  return (
    <View className="flex flex-row m-2">
      <GalleryTouchableOpacity
        onPress={handlePress}
        className="flex-row flex-1 items-start space-x-2 border border-activeBlue dark:border-darkModeBlue p-3"
        eventElementId="Announcement Notification"
        eventName="Announcement Notification Pressed"
        eventContext={contexts.Notifications}
      >
        <View className="flex-row flex-1 items-center space-x-2">
          <FastImage
            style={{ width: 56, height: 56 }}
            resizeMode={ResizeMode.COVER}
            source={{ uri: announcement.imageUrl }}
          />
          <View className="flex flex-col flex-1 ">
            <BaseM weight="Bold" classNameOverride="text-activeBlue dark:text-darkModeBlue">
              {announcement.title}
            </BaseM>
            <BaseM classNameOverride="text-activeBlue dark:text-darkModeBlue">
              {announcement.description}
            </BaseM>
          </View>
        </View>
        <GalleryTouchableOpacity
          onPress={handleDismissPress}
          eventElementId="Dismiss Announcement Button"
          eventName="Pressed Dismiss Announcement Button"
          eventContext={contexts.Notifications}
        >
          <XMarkIcon color={colorScheme === 'dark' ? colors.darkModeBlue : colors.activeBlue} />
        </GalleryTouchableOpacity>
      </GalleryTouchableOpacity>
    </View>
  );
}
