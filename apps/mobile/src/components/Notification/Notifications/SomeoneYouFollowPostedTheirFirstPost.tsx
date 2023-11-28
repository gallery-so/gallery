import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Text, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import ProcessedText from '~/components/ProcessedText/ProcessedText';
import { Typography } from '~/components/Typography';
import { SomeoneYouFollowPostedTheirFirstPostFragment$key } from '~/generated/SomeoneYouFollowPostedTheirFirstPostFragment.graphql';
import { SomeoneYouFollowPostedTheirFirstPostQueryFragment$key } from '~/generated/SomeoneYouFollowPostedTheirFirstPostQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';

import { NotificationSkeleton } from '../NotificationSkeleton';

type Props = {
  queryRef: SomeoneYouFollowPostedTheirFirstPostQueryFragment$key;
  notificationRef: SomeoneYouFollowPostedTheirFirstPostFragment$key;
};

export function SomeoneYouFollowPostedTheirFirstPost({ queryRef, notificationRef }: Props) {
  const query = useFragment(
    graphql`
      fragment SomeoneYouFollowPostedTheirFirstPostQueryFragment on Query {
        ...NotificationSkeletonQueryFragment
      }
    `,
    queryRef
  );

  const notification = useFragment(
    graphql`
      fragment SomeoneYouFollowPostedTheirFirstPostFragment on SomeoneYouFollowPostedTheirFirstPostNotification {
        __typename
        post {
          dbid
          author {
            username
            ...NotificationSkeletonResponsibleUsersFragment
          }
          caption
        }
        ...NotificationSkeletonFragment
      }
    `,
    notificationRef
  );

  const { post } = notification;
  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const postAuthor = notification.post?.author;

  const handlePress = useCallback(() => {
    if (post?.dbid) {
      navigation.navigate('Post', { postId: post.dbid });
    }
  }, [navigation, post?.dbid]);

  const handleUserPress = useCallback(() => {
    if (postAuthor?.username) {
      navigation.navigate('Profile', { username: postAuthor.username });
    }
  }, [navigation, postAuthor?.username]);

  return (
    <NotificationSkeleton
      queryRef={query}
      onPress={handlePress}
      notificationRef={notification}
      responsibleUserRefs={postAuthor ? [postAuthor] : []}
    >
      <View className="flex space-y-0.5 pt-1">
        <View className="flex-row items-center">
          <GalleryTouchableOpacity
            onPress={handleUserPress}
            eventName={null}
            eventElementId={null}
            eventContext={contexts['Notifications']}
          >
            <Typography
              font={{
                family: 'ABCDiatype',
                weight: 'Bold',
              }}
              className="text-sm"
            >
              {postAuthor ? postAuthor?.username : 'Someone'}
            </Typography>
          </GalleryTouchableOpacity>
          <Text>
            {' '}
            <Typography
              font={{
                family: 'ABCDiatype',
                weight: 'Regular',
              }}
              className="text-sm"
            >
              made their first
            </Typography>{' '}
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
        </View>
        {post?.caption && (
          <View className="border-l-2 border-[#d9d9d9] pl-2 px-2">
            <ProcessedText text={post.caption} numberOfLines={2} />
          </View>
        )}
      </View>
    </NotificationSkeleton>
  );
}
