import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { contexts } from 'shared/analytics/constants';
import { useAdmireComment } from 'src/hooks/useAdmireComment';

import { AdmireIcon } from '~/components/Feed/Socialize/AdmireIcon';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { NotificationSkeleton } from '~/components/Notification/NotificationSkeleton';
import { Typography } from '~/components/Typography';
import { SomeoneRepliedToYourCommentFragment$key } from '~/generated/SomeoneRepliedToYourCommentFragment.graphql';
import { SomeoneRepliedToYourCommentQueryFragment$key } from '~/generated/SomeoneRepliedToYourCommentQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { getTimeSince } from '~/shared/utils/time';

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
        ...useAdmireCommentQueryFragment
      }
    `,
    queryRef
  );

  const notification = useFragment(
    graphql`
      fragment SomeoneRepliedToYourCommentFragment on SomeoneRepliedToYourCommentNotification {
        __typename
        updatedTime

        comment @required(action: THROW) {
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
          replyTo {
            dbid
          }
          ...useAdmireCommentFragment
        }

        ...NotificationSkeletonFragment
      }
    `,
    notificationRef
  );

  const post = notification.comment?.source ?? {};

  const commenter = notification.comment?.commenter;
  const { comment } = notification;

  const { toggleAdmire, hasViewerAdmiredComment } = useAdmireComment({
    commentRef: comment,
    queryRef: query,
  });

  const commenters = useMemo(() => {
    return removeNullValues([commenter]);
  }, [commenter]);

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handlePress = useCallback(() => {
    if (post?.dbid) {
      navigation.navigate('Post', { postId: post.dbid, commentId: notification.comment?.dbid });
    }
  }, [navigation, post?.dbid, notification.comment?.dbid]);

  const handleReplyPress = useCallback(() => {
    if (post?.dbid) {
      navigation.navigate('Post', {
        postId: post.dbid,
        commentId: notification.comment?.dbid,
        replyToComment: {
          username: commenter?.username ?? '',
          commentId: notification.comment?.dbid,
          comment: notification.comment?.comment ?? '',
          topCommentId: notification.comment?.replyTo?.dbid ?? notification.comment?.dbid,
        },
      });
    }
  }, [
    navigation,
    post?.dbid,
    notification.comment?.dbid,
    commenter?.username,
    notification.comment?.comment,
    notification.comment?.replyTo?.dbid,
  ]);

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
          </Typography>{' '}
          <Typography
            className="text-metal text-xs"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            {getTimeSince(notification.updatedTime)}
          </Typography>
        </Text>

        <View className="space-y-1">
          <View className="border-l-2 border-[#d9d9d9] pl-2 px-2 w-64">
            <Text className="dark:text-white" numberOfLines={3}>
              {notification.comment?.comment ?? ''}
            </Text>
          </View>
          <View className="flex-row items-center space-x-2">
            <GalleryTouchableOpacity
              eventElementId={'Notification Admire Icon'}
              eventName={'Notification Admire Icon Clicked'}
              eventContext={contexts.Notifications}
              onPress={toggleAdmire}
              properties={{
                notificationType: notification.__typename,
              }}
            >
              <AdmireIcon height={16} active={hasViewerAdmiredComment} />
            </GalleryTouchableOpacity>
            <GalleryTouchableOpacity
              onPress={handleReplyPress}
              eventElementId="Notification Reply Button"
              eventName="Notification Reply Button Clicked"
              eventContext={contexts.Notifications}
              properties={{
                notificationType: notification.__typename,
              }}
            >
              <Typography
                font={{
                  family: 'ABCDiatype',
                  weight: 'Bold',
                }}
                className="text-xs"
              >
                Reply
              </Typography>
            </GalleryTouchableOpacity>
          </View>
        </View>
      </View>
    </NotificationSkeleton>
  );
}
