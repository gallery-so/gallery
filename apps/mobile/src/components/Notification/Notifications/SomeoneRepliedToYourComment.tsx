import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NotificationSkeleton } from '~/components/Notification/NotificationSkeleton';
import { Typography } from '~/components/Typography';
import { SomeoneRepliedToYourCommentFragment$key } from '~/generated/SomeoneRepliedToYourCommentFragment.graphql';
import { SomeoneRepliedToYourCommentQueryFragment$key } from '~/generated/SomeoneRepliedToYourCommentQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { removeNullValues } from '~/shared/relay/removeNullValues';

type SomeoneCommentedOnYourFeedEventProps = {
  queryRef: SomeoneRepliedToYourCommentQueryFragment$key;
  notificationRef: SomeoneRepliedToYourCommentFragment$key;
};

export function SomeoneRepliedToYourComment({
  queryRef,
  notificationRef,
}: SomeoneCommentedOnYourFeedEventProps) {
  const query = useFragment(
    graphql`
      fragment SomeoneRepliedToYourCommentQueryFragment on Query {
        ...NotificationSkeletonQueryFragment
      }
    `,
    queryRef
  );

  const notification = useFragment(
    graphql`
      fragment SomeoneRepliedToYourCommentFragment on SomeoneRepliedToYourCommentNotification {
        __typename

        comment {
          dbid
          commenter {
            username
            ...NotificationSkeletonResponsibleUsersFragment
          }
          comment
          source {
            ... on Post {
              dbid
            }
          }
        }

        ...NotificationSkeletonFragment
      }
    `,
    notificationRef
  );

  const post = notification.comment?.source ?? {};

  const commenter = notification.comment?.commenter;

  const commenters = useMemo(() => {
    return removeNullValues([commenter]);
  }, [commenter]);

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handlePress = useCallback(() => {
    if (post?.dbid) {
      navigation.navigate('Post', { postId: post.dbid, commentId: notification.comment?.dbid });
    }
  }, [navigation, post?.dbid, notification.comment?.dbid]);

  return (
    <NotificationSkeleton
      queryRef={query}
      onPress={handlePress}
      responsibleUserRefs={commenters}
      notificationRef={notification}
    >
      <View className="flex space-y-0.5">
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
          replied to your{' '}
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Bold',
            }}
            className="text-sm"
          >
            comment
          </Typography>
        </Text>

        <View className="border-l-2 border-[#d9d9d9] pl-2 px-2">
          <Text className="dark:text-white" numberOfLines={3}>
            {notification.comment?.comment ?? ''}
          </Text>
        </View>
      </View>
    </NotificationSkeleton>
  );
}
