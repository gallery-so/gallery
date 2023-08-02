import { useNavigation } from '@react-navigation/native';
import { ResizeMode } from 'expo-av';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NotificationSkeleton } from '~/components/Notification/NotificationSkeleton';
import { Typography } from '~/components/Typography';
import { SomeoneCommentedOnYourPostFragment$key } from '~/generated/SomeoneCommentedOnYourPostFragment.graphql';
import { SomeoneCommentedOnYourPostQueryFragment$key } from '~/generated/SomeoneCommentedOnYourPostQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';
import { removeNullValues } from '~/shared/relay/removeNullValues';

type SomeoneCommentedOnYourFeedEventProps = {
  queryRef: SomeoneCommentedOnYourPostQueryFragment$key;
  notificationRef: SomeoneCommentedOnYourPostFragment$key;
};

export function SomeoneCommentedOnYourPost({
  queryRef,
  notificationRef,
}: SomeoneCommentedOnYourFeedEventProps) {
  const query = useFragment(
    graphql`
      fragment SomeoneCommentedOnYourPostQueryFragment on Query {
        ...NotificationSkeletonQueryFragment
      }
    `,
    queryRef
  );

  const notification = useFragment(
    graphql`
      fragment SomeoneCommentedOnYourPostFragment on SomeoneCommentedOnYourPostNotification {
        __typename

        comment {
          commenter {
            username
            ...NotificationSkeletonResponsibleUsersFragment
          }
          comment
        }

        post {
          dbid
          tokens {
            __typename
            ...getVideoOrImageUrlForNftPreviewFragment
          }
        }

        ...NotificationSkeletonFragment
      }
    `,
    notificationRef
  );

  const { post } = notification;

  const nonNullTokens = useMemo(() => {
    const tokens = post?.tokens;

    return removeNullValues(tokens);
  }, [post?.tokens]);

  const token = nonNullTokens?.[0] || null;

  if (!token) {
    throw new Error('There is no token in post');
  }

  const media = getVideoOrImageUrlForNftPreview({
    tokenRef: token,
    preferStillFrameFromGif: true,
  });

  const tokenUrl = media?.urls.small;

  const commenters = useMemo(() => {
    return removeNullValues([notification.comment?.commenter]);
  }, [notification.comment?.commenter]);

  const commenter = notification.comment?.commenter;

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  // const handlePress = useCallback(() => {
  //   if (notification.feedEvent?.dbid) {
  //     navigation.navigate('FeedEvent', { eventId: notification.feedEvent?.dbid });
  //   }
  // }, [navigation, notification.feedEvent?.dbid]);

  const handlePress = () => {};

  return (
    <NotificationSkeleton
      queryRef={query}
      onPress={handlePress}
      responsibleUserRefs={commenters}
      notificationRef={notification}
    >
      <View className="flex-row space-x-2">
        <View className="flex space-y-2">
          <Text className="dark:text-white">
            <Typography
              font={{
                family: 'ABCDiatype',
                weight: 'Bold',
              }}
              className="text-sm"
            >
              {commenter ? commenter.username : 'Someone'}
            </Typography>{' '}
            commented on your{' '}
            <Typography
              font={{
                family: 'ABCDiatype',
                weight: 'Bold',
              }}
              className="text-sm"
            >
              post
            </Typography>
          </Text>

          <View className="ml-4 border-l-2 border-[#d9d9d9] pl-2">
            <Text className="dark:text-white">{notification.comment?.comment ?? ''}</Text>
          </View>
        </View>

        {tokenUrl && (
          <FastImage
            style={{
              width: 56,
              height: 56,
            }}
            source={{ uri: tokenUrl }}
            resizeMode={ResizeMode.COVER}
          />
        )}
      </View>
    </NotificationSkeleton>
  );
}
