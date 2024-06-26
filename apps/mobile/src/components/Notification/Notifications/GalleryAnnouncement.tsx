import clsx from 'clsx';
import { useCallback } from 'react';
import { Linking, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { graphql, useFragment } from 'react-relay';

import { Button } from '~/components/Button';
import MintCampaignBottomSheet from '~/components/Mint/MintCampaign/MintCampaignBottomSheet';
import { Typography } from '~/components/Typography';
import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { GalleryAnnouncementFragment$key } from '~/generated/GalleryAnnouncementFragment.graphql';
import { GalleryAnnouncementQueryFragment$key } from '~/generated/GalleryAnnouncementQueryFragment.graphql';
import { contexts } from '~/shared/analytics/constants';

import { NotificationSkeleton } from '../NotificationSkeleton';

type Props = {
  notificationRef: GalleryAnnouncementFragment$key;
  queryRef: GalleryAnnouncementQueryFragment$key;
};

export function GalleryAnnouncement({ queryRef, notificationRef }: Props) {
  const notification = useFragment(
    graphql`
      fragment GalleryAnnouncementFragment on GalleryAnnouncementNotification {
        __typename
        title
        description
        ctaText
        ctaLink
        imageUrl
        internalId
        ...NotificationSkeletonFragment
      }
    `,
    notificationRef
  );

  const query = useFragment(
    graphql`
      fragment GalleryAnnouncementQueryFragment on Query {
        ...NotificationSkeletonQueryFragment
      }
    `,
    queryRef
  );

  const { title, description, ctaText, ctaLink, imageUrl, internalId } = notification;
  const { showBottomSheetModal, hideBottomSheetModal } = useBottomSheetModalActions();
  const handlePress = useCallback(() => {
    if (internalId === 'apr-2024-mchx-collab') {
      showBottomSheetModal({
        content: (
          <MintCampaignBottomSheet
            onClose={hideBottomSheetModal}
            projectInternalId="mchx-app-store-2024"
          />
        ),
      });
      return;
    }
    if (!ctaLink) return;
    Linking.openURL(ctaLink);
  }, [ctaLink, hideBottomSheetModal, internalId, showBottomSheetModal]);

  return (
    <NotificationSkeleton
      queryRef={query}
      onPress={handlePress}
      responsibleUserRefs={[]}
      notificationRef={notification}
      overridePfpElement={
        imageUrl ? (
          <FastImage source={{ uri: imageUrl }} style={{ width: 64, height: 64 }} />
        ) : (
          <View className="w-16 h-16 bg-gray-200 " />
        )
      }
    >
      <View className="flex flex-row items-center">
        <View className={clsx('flex-row items-center space-x-2', ctaText ? 'flex-1' : null)}>
          <View className="flex-1 pl-2">
            <Typography
              font={{
                family: 'ABCDiatype',
                weight: 'Bold',
              }}
              className="text-sm"
            >
              {title}
            </Typography>
            <Typography
              font={{
                family: 'ABCDiatype',
                weight: 'Regular',
              }}
              className="text-sm"
            >
              {description}
            </Typography>
          </View>
        </View>

        {ctaText && (
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
            properties={{ type: notification.__typename }}
          />
        )}
      </View>
    </NotificationSkeleton>
  );
}
