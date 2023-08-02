import { ResizeMode } from 'expo-av';
import { View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { graphql, useFragment } from 'react-relay';

import { Button } from '~/components/Button';
import { Typography } from '~/components/Typography';
import { NewTokensFragment$key } from '~/generated/NewTokensFragment.graphql';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';
import colors from '~/shared/theme/colors';
import { getTimeSince } from '~/shared/utils/time';

import { UnseenDot } from '../NotificationSkeleton';

type Props = {
  notificationRef: NewTokensFragment$key;
};

export function NewTokens({ notificationRef }: Props) {
  const notification = useFragment(
    graphql`
      fragment NewTokensFragment on NewTokensNotification {
        __typename
        seen
        updatedTime
        token {
          ... on Token {
            __typename
            dbid
            name
            ...getVideoOrImageUrlForNftPreviewFragment
          }
        }
        ...NotificationSkeletonFragment
      }
    `,
    notificationRef
  );

  const { token } = notification;

  if (!token) {
    return null;
  }

  const media = getVideoOrImageUrlForNftPreview({
    tokenRef: token,
    preferStillFrameFromGif: false,
  });

  const tokenUrl = media?.urls.small;

  const handlePress = () => {};

  return (
    <View className="flex flex-row items-center space-x-2 p-3">
      {tokenUrl ? (
        <FastImage
          style={{
            width: 56,
            height: 56,
          }}
          source={{ uri: tokenUrl }}
          resizeMode={ResizeMode.COVER}
        />
      ) : (
        <View
          style={{
            width: 56,
            height: 56,
            backgroundColor: colors.porcelain,
          }}
        />
      )}

      <View className="flex-1">
        <Typography
          font={{
            family: 'ABCDiatype',
            weight: 'Regular',
          }}
          className="text-sm"
        >
          Minted
        </Typography>
        <Typography
          font={{
            family: 'ABCDiatype',
            weight: 'Bold',
          }}
          className="text-sm"
        >
          {token.name ? token.name : 'Unknown'}
        </Typography>
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
      <View className="flex w-10 flex-row items-center justify-end space-x-2">
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
