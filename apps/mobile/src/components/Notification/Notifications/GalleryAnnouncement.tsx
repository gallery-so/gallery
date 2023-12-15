import { useCallback } from 'react';
import { Linking, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { graphql, useFragment } from 'react-relay';

import { Button } from '~/components/Button';
import { Typography } from '~/components/Typography';
import { GalleryAnnouncementFragment$key } from '~/generated/GalleryAnnouncementFragment.graphql';
import { contexts } from '~/shared/analytics/constants';

import { UnseenDot } from '../NotificationSkeleton';

type Props = {
  notificationRef: GalleryAnnouncementFragment$key;
};

export function GalleryAnnouncement({ notificationRef }: Props) {
  const notification = useFragment(
    graphql`
      fragment GalleryAnnouncementFragment on GalleryAnnouncementNotification {
        __typename
        seen
        title
        description
        ctaText
        ctaLink
        imageUrl
        ...NotificationSkeletonFragment
      }
    `,
    notificationRef
  );

  const { title, description, ctaText, ctaLink, imageUrl, seen } = notification;

  const handlePress = useCallback(() => {
    if (!ctaLink) return;
    Linking.openURL(ctaLink);
  }, [ctaLink]);

  return (
    <View className="flex flex-row items-center p-4">
      <View className="flex-row flex-1 items-center space-x-2">
        {!seen && (
          <View className={'w-[17px] flex-row items-center justify-start'}>
            <UnseenDot />
          </View>
        )}

        {imageUrl ? (
          <FastImage source={{ uri: imageUrl }} style={{ width: 56, height: 56 }} />
        ) : (
          <View className="w-[56px] h-[56px] bg-gray-200 " />
        )}

        <View className="flex-1">
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Regular',
            }}
            className="text-sm"
          >
            {title}
          </Typography>
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Bold',
            }}
            numberOfLines={2}
            className="text-sm"
          >
            {description}
          </Typography>
        </View>
      </View>
      <Button
        onPress={handlePress}
        className="w-20"
        text={ctaText || 'View'}
        size="xs"
        fontWeight="Bold"
        // manually tracking this to be the same params as `NotificationSkeleton`,
        // since this component didn't use the NotificationSkeleton component
        eventElementId="Notification Row"
        eventName="Notification Row Clicked"
        eventContext={contexts.Notifications}
        // properties={{ type: notification.__typename }}
      />
    </View>
  );
}
