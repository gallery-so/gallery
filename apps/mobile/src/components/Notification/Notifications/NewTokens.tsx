import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { Button } from '~/components/Button';
import { Typography } from '~/components/Typography';
import { NewTokensFragment$key } from '~/generated/NewTokensFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';

import { UnseenDot } from '../NotificationSkeleton';
import { NotificationTokenPreviewWithBoundary } from './NotificationTokenPreview';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';

type Props = {
  notificationRef: NewTokensFragment$key;
};

export function NewTokens({ notificationRef }: Props) {
  const notification = useFragment(
    graphql`
      fragment NewTokensFragment on NewTokensNotification {
        __typename
        count
        seen

        token {
          ... on Token {
            __typename
            dbid
            definition {
              name
            }
            ...NotificationTokenPreviewWithBoundaryFragment
          }
        }
        ...NotificationSkeletonFragment
      }
    `,
    notificationRef
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const { token } = notification;

  const quantity = notification.count ?? 1;

  if (token?.__typename !== 'Token') {
    throw new Error("We couldn't find that token. Something went wrong and we're looking into it.");
  }

  const handlePress = useCallback(() => {
    if (!token.dbid) return;

    navigation.navigate('PostComposer', {
      tokenId: token.dbid,
    });
  }, [navigation, token.dbid]);

  const handleRowPress = useCallback(() => {
    if (!token.dbid) return;

    navigation.navigate('UniversalNftDetail', {
      cachedPreviewAssetUrl: '',
      tokenId: token.dbid,
    });
  }, [navigation, token.dbid]);

  return (
    <View className="flex flex-row items-center p-4">
      <GalleryTouchableOpacity
        onPress={handleRowPress}
        className="flex-row flex-1 items-center space-x-2"
        eventElementId="Notification Row Clicked"
        eventName="Notification Row Clicked"
        eventContext={contexts.Notifications}
      >
        {!notification.seen && (
          <View className={'w-[17px] flex-row items-center justify-start'}>
            <UnseenDot />
          </View>
        )}
        <View className="w-[56px] h-[56px]">
          <NotificationTokenPreviewWithBoundary tokenRef={token} count={quantity} />
        </View>

        <View className="flex-1">
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Regular',
            }}
            className="text-sm"
          >
            Collected
            {quantity > 1 && ` ${quantity}x`}
          </Typography>
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Bold',
            }}
            numberOfLines={2}
            className="text-sm"
          >
            {token.definition?.name ? token.definition.name : 'Unknown'}
          </Typography>
        </View>
      </GalleryTouchableOpacity>
      <Button
        onPress={handlePress}
        className="w-20"
        text="Post"
        textClassName="normal-case"
        size="xs"
        fontWeight="Bold"
        // manually tracking this to be the same params as `NotificationSkeleton`,
        // since this component didn't use the NotificationSkeleton component
        eventElementId="Notification Row Post Button"
        eventName="Notification Row Post Button Clicked"
        eventContext={contexts.Notifications}
        properties={{ type: notification.__typename }}
      />
    </View>
  );
}
