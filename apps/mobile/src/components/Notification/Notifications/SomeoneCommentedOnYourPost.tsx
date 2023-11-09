import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NotificationSkeleton } from '~/components/Notification/NotificationSkeleton';
import { Typography } from '~/components/Typography';
import { SomeoneCommentedOnYourPostFragment$key } from '~/generated/SomeoneCommentedOnYourPostFragment.graphql';
import { SomeoneCommentedOnYourPostQueryFragment$key } from '~/generated/SomeoneCommentedOnYourPostQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
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
        }

        ...NotificationSkeletonFragment
      }
    `,
    notificationRef
  );

  const { post } = notification;

  const commenters = useMemo(() => {
    return removeNullValues([notification.comment?.commenter]);
  }, [notification.comment?.commenter]);

  const commenter = notification.comment?.commenter;

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handlePress = useCallback(() => {
    if (post?.dbid) {
      navigation.navigate('Post', { postId: post.dbid });
    }
  }, [navigation, post?.dbid]);

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

        <View className="border-l-2 border-[#d9d9d9] pl-2 px-2">
          <Text className="dark:text-white" numberOfLines={3}>
            {notification.comment?.comment ?? ''}
          </Text>
        </View>
      </View>
    </NotificationSkeleton>
  );
}
