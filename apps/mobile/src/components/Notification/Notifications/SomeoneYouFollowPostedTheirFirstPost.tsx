import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Text, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
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
      <View className="flex pt-1">
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <GalleryTouchableOpacity
            onPress={handleUserPress}
            eventName={null}
            eventElementId={null}
            eventContext={contexts['Notifications']}
          >
            <Text>
              <Typography
                font={{
                  family: 'ABCDiatype',
                  weight: 'Bold',
                }}
                className="text-sm"
              >
                {postAuthor ? postAuthor?.username : 'Someone'}
              </Typography>
            </Text>
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
              created their first
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
      </View>
    </NotificationSkeleton>
  );
}
