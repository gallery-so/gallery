import { useNavigation } from '@react-navigation/native';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { removeNullValues } from 'shared/relay/removeNullValues';
import { getTimeSince } from 'shared/utils/time';
import { noop } from 'swr/_internal';

import ProcessedText from '~/components/ProcessedText/ProcessedText';
import { Typography } from '~/components/Typography';
import { NotificationSkeletonResponsibleUsersFragment$key } from '~/generated/NotificationSkeletonResponsibleUsersFragment.graphql';
import { SomeoneMentionedYourCommunityFragment$key } from '~/generated/SomeoneMentionedYourCommunityFragment.graphql';
import { SomeoneMentionedYourCommunityQueryFragment$key } from '~/generated/SomeoneMentionedYourCommunityQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';

import { NotificationSkeleton } from '../NotificationSkeleton';

type SomeoneMentionedYourCommunityProps = {
  queryRef: SomeoneMentionedYourCommunityQueryFragment$key;
  notificationRef: SomeoneMentionedYourCommunityFragment$key;
};

type NotificationDataType = {
  author: string;
  message: string;
  usersMentioned: NotificationSkeletonResponsibleUsersFragment$key;
  onPress: () => void;
  type: 'post' | 'comment';
};

export function SomeoneMentionedYourCommunity({
  queryRef,
  notificationRef,
}: SomeoneMentionedYourCommunityProps) {
  const query = useFragment(
    graphql`
      fragment SomeoneMentionedYourCommunityQueryFragment on Query {
        ...NotificationSkeletonQueryFragment
      }
    `,
    queryRef
  );

  const notification = useFragment(
    graphql`
      fragment SomeoneMentionedYourCommunityFragment on SomeoneMentionedYourCommunityNotification {
        __typename
        updatedTime

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
            dbid
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

  const notificationData: NotificationDataType = useMemo(() => {
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
      const { mentionSource } = notification;
      const author = mentionSource?.commenter?.username ?? 'Someone';
      const message = mentionSource?.comment ?? '';
      const usersMentioned = removeNullValues([mentionSource?.commenter]);

      const onPress = () => {
        let postId = '';
        let commentId = '';

        if (mentionSource.__typename === 'Comment') {
          commentId = mentionSource.dbid;
          if (
            mentionSource.source?.__typename === 'Post' ||
            mentionSource.source?.__typename === 'FeedEvent'
          ) {
            postId = mentionSource.source.dbid;
          }
        }

        navigation.navigate('Post', {
          postId: postId || ' ',
          commentId: commentId || '',
        });
      };

      return { author, message, usersMentioned, onPress, type: 'comment' };
    }

    return {
      author: 'Someone',
      message: '',
      usersMentioned: [],
      onPress: noop,
      type: 'post',
    };
  }, [navigation, notification]);

  if (!notification) {
    return null;
  }

  const { author, message, usersMentioned, onPress } = notificationData;

  return (
    <NotificationSkeleton
      queryRef={query}
      onPress={onPress}
      responsibleUserRefs={usersMentioned}
      notificationRef={notification}
    >
      <View className="flex space-y-0.5 pt-1">
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
          mentioned your work{' '}
          <Typography
            className="text-metal text-xs"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            {getTimeSince(notification.updatedTime)}
          </Typography>
        </Text>

        <View className="border-l-2 border-[#d9d9d9] pl-2 px-2">
          <ProcessedText text={message ?? ''} numberOfLines={2} />
        </View>
      </View>
    </NotificationSkeleton>
  );
}
