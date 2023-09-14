import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { Button } from '~/components/Button';
import { Typography } from '~/components/Typography';
import { NewTokensFragment$key } from '~/generated/NewTokensFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { getTimeSince } from '~/shared/utils/time';

import { UnseenDot } from '../NotificationSkeleton';
import { NotificationTokenPreviewWithBoundary } from './NotificationTokenPreview';

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
        updatedTime
        token {
          ... on Token {
            __typename
            dbid
            name
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

  return (
    <View className="flex flex-row items-center p-4">
      <View className="flex-row flex-1 items-center space-x-2">
        <NotificationTokenPreviewWithBoundary tokenRef={token} count={quantity} />

        <View className="flex-1">
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Regular',
            }}
            className="text-sm"
          >
            Minted
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
            {token.name ? token.name : 'Unknown'}
          </Typography>
        </View>
      </View>
      <Button
        onPress={handlePress}
        className="w-20"
        text="Post"
        size="xs"
        fontWeight="Bold"
        eventElementId={null}
        eventName={null}
      />
      <View
        className={`w-[35px] flex-row space-x-2 items-center ${
          !notification.seen ? 'justify-between' : 'justify-end'
        }`}
      >
        <Typography
          className="text-metal text-xs"
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
        >
          {getTimeSince(notification.updatedTime)}
        </Typography>
        {!notification.seen && <UnseenDot />}
      </View>
    </View>
  );
}
