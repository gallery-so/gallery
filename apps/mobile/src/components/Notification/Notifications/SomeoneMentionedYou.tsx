import { useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NotificationSkeleton } from '~/components/Notification/NotificationSkeleton';
import { Typography } from '~/components/Typography';
import { NotificationSkeletonResponsibleUsersFragment$key } from '~/generated/NotificationSkeletonResponsibleUsersFragment.graphql';
import { SomeoneMentionedYouFragment$key } from '~/generated/SomeoneMentionedYouFragment.graphql';
import { SomeoneMentionedYouQueryFragment$key } from '~/generated/SomeoneMentionedYouQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { removeNullValues } from '~/shared/relay/removeNullValues';

type SomeoneCommentedOnYourFeedEventProps = {
  queryRef: SomeoneMentionedYouQueryFragment$key;
  notificationRef: SomeoneMentionedYouFragment$key;
};

type NotificationDataType = {
  author: string;
  message: string;
  usersMentioned: NotificationSkeletonResponsibleUsersFragment$key;
  onPress: () => void;
  type: 'post' | 'comment';
};

export function SomeoneMentionedYou({
  queryRef,
  notificationRef,
}: SomeoneCommentedOnYourFeedEventProps) {
  const query = useFragment(
    graphql`
      fragment SomeoneMentionedYouQueryFragment on Query {
        ...NotificationSkeletonQueryFragment
      }
    `,
    queryRef
  );

  const notification = useFragment(
    graphql`
      fragment SomeoneMentionedYouFragment on SomeoneMentionedYouNotification {
        __typename

        mentionSource @required(action: THROW) {
          __typename
          ... on Post {
            __typename
            dbid
            caption
            author {
              username
              ...NotificationSkeletonResponsibleUsersFragment
            }
          }
          ... on Comment {
            __typename
            commenter {
              username
              ...NotificationSkeletonResponsibleUsersFragment
            }
            source {
              ... on Post {
                __typename
                dbid
              }
              ... on FeedEvent {
                __typename
                dbid
              }
            }
            comment
          }
        }

        ...NotificationSkeletonFragment
      }
    `,
    notificationRef
  );

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const noficationData: NotificationDataType = useMemo(() => {
    if (notification?.mentionSource?.__typename === 'Post') {
      return {
        author: notification.mentionSource?.author?.username ?? 'Someone',
        message: notification.mentionSource?.caption ?? '',
        usersMentioned: removeNullValues([notification.mentionSource?.author]),
        onPress: () => {
          let postId = '';

          if (notification.mentionSource.__typename === 'Post') {
            postId = notification.mentionSource.dbid;
          }
          navigation.navigate('Post', { postId });
        },
        type: 'post',
      };
    }

    if (notification?.mentionSource?.__typename === 'Comment') {
      return {
        author: notification.mentionSource?.commenter?.username ?? 'Someone',
        message: notification?.mentionSource?.comment ?? '',
        usersMentioned: removeNullValues([notification.mentionSource?.commenter]),
        onPress: () => {
          let postId = '';

          const { mentionSource } = notification;

          if (mentionSource.__typename === 'Post') {
            postId = mentionSource.dbid;
          } else if (mentionSource.__typename === 'Comment') {
            if (mentionSource.source?.__typename === 'Post') {
              postId = mentionSource.source.dbid;
            } else if (mentionSource.source?.__typename === 'FeedEvent') {
              postId = mentionSource.source.dbid;
            }
          }

          navigation.navigate('Post', { postId: postId ?? ' ' });
        },
        type: 'comment',
      };
    }

    return {
      author: 'Someone',
      message: '',
      usersMentioned: [],
      onPress: () => {},
      type: 'post',
    };
  }, [navigation, notification]);

  if (!notification) {
    return null;
  }

  const { author, message, usersMentioned, onPress, type } = noficationData;

  return (
    <NotificationSkeleton
      queryRef={query}
      onPress={onPress}
      responsibleUserRefs={usersMentioned}
      notificationRef={notification}
    >
      <View className="flex space-y-2">
        <Text className="dark:text-white">
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Bold',
            }}
            className="text-sm"
          >
            {author}
          </Typography>{' '}
          mentioned you in a{' '}
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Bold',
            }}
            className="text-sm"
          >
            {type}
          </Typography>
        </Text>

        <View className="border-l-2 border-[#d9d9d9] pl-2 px-2">
          <Text className="dark:text-white" numberOfLines={3}>
            {message ?? ''}
          </Text>
        </View>
      </View>
    </NotificationSkeleton>
  );
}
