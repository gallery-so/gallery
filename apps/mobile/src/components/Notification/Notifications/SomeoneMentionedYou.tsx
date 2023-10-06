import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NotificationSkeleton } from '~/components/Notification/NotificationSkeleton';
import { Typography } from '~/components/Typography';
import { SomeoneMentionedYouFragment$key } from '~/generated/SomeoneMentionedYouFragment.graphql';
import { SomeoneMentionedYouQueryFragment$key } from '~/generated/SomeoneMentionedYouQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { replaceUrlsWithMarkdownFormat } from '~/shared/utils/replaceUrlsWithMarkdownFormat';

type SomeoneCommentedOnYourFeedEventProps = {
  queryRef: SomeoneMentionedYouQueryFragment$key;
  notificationRef: SomeoneMentionedYouFragment$key;
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
            dbid
            caption
            author {
              username
              ...NotificationSkeletonResponsibleUsersFragment
            }
          }
          ... on Comment {
            commenter {
              username
              ...NotificationSkeletonResponsibleUsersFragment
            }
            source {
              ... on Post {
                dbid
              }
              ... on FeedEvent {
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

  const usersMentioned = useMemo(() => {
    if (notification?.mentionSource?.__typename === 'Post') {
      return removeNullValues([notification.mentionSource?.author]);
    }

    if (notification?.mentionSource?.__typename === 'Comment') {
      return removeNullValues([notification.mentionSource?.commenter]);
    }

    return [];
  }, [notification?.mentionSource]);

  const messageType = useMemo(() => {
    if (notification?.mentionSource?.__typename === 'Post') {
      return 'post';
    }
    return 'comment';
  }, [notification?.mentionSource]);

  const message = useMemo(() => {
    let formattedMessage = '';

    if (notification?.mentionSource?.__typename === 'Post') {
      formattedMessage = notification.mentionSource?.caption ?? '';
    }
    if (notification?.mentionSource?.__typename === 'Comment') {
      formattedMessage = notification?.mentionSource?.comment ?? '';
    }

    return replaceUrlsWithMarkdownFormat(formattedMessage);
  }, [notification?.mentionSource]);

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const handlePress = useCallback(() => {
    if (notification.mentionSource.__typename === 'Post') {
      navigation.navigate('Post', { postId: notification.mentionSource.dbid });
    } else if (notification.mentionSource.__typename === 'Comment') {
      navigation.navigate('Post', { postId: notification.mentionSource.source?.dbid ?? ' ' });
    }
  }, [navigation, notification.mentionSource]);

  const author = useMemo(() => {
    if (notification.mentionSource.__typename === 'Post') {
      return notification.mentionSource.author?.username;
    } else if (notification.mentionSource.__typename === 'Comment') {
      return notification.mentionSource.commenter?.username;
    } else {
      return 'Someone';
    }
  }, [notification.mentionSource]);

  if (!notification) {
    return null;
  }

  return (
    <NotificationSkeleton
      queryRef={query}
      onPress={handlePress}
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
            {messageType}
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
