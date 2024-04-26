import { ResizeMode } from 'expo-av';
import { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { contexts } from 'shared/analytics/constants';

import { Button } from '~/components/Button';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { BaseM } from '~/components/Text';
import { useAnnouncementContext } from '~/contexts/AnnouncementContext';

// display announcement content from Sanity
export default function AnnouncementNotification() {
  const { announcement, markAnnouncementAsSeen } = useAnnouncementContext();
  const handlePress = useCallback(() => {}, []);

  useEffect(() => {
    markAnnouncementAsSeen();
    // Only run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!announcement) {
    return null;
  }

  return (
    <View className="flex flex-row items-center m-2">
      <GalleryTouchableOpacity
        onPress={handlePress}
        className="flex-row flex-1 items-center space-x-2 border border-blue-700 p-3"
        eventElementId="Announcement Notification"
        eventName="Announcement Notification Pressed"
        eventContext={contexts.Notifications}
      >
        <FastImage
          style={{ width: 56, height: 56 }}
          resizeMode={ResizeMode.COVER}
          source={{ uri: announcement.imageUrl }}
        />
        <View className="flex flex-col flex-1 ">
          <BaseM weight="Bold">{announcement.title}</BaseM>
          <BaseM>{announcement.description}</BaseM>
        </View>
        {announcement.ctaText && (
          <Button
            text={announcement.ctaText}
            eventElementId={null}
            eventName={null}
            eventContext={null}
            textClassName="normal-case"
            size="xs"
            fontWeight="Bold"
            className="w-20"
          />
        )}
      </GalleryTouchableOpacity>
    </View>
  );
}
