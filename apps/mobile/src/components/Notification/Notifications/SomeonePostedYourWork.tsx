import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { NotificationSkeleton } from '~/components/Notification/NotificationSkeleton';
import { Typography } from '~/components/Typography';
import { SomeonePostedYourWorkFragment$key } from '~/generated/SomeonePostedYourWorkFragment.graphql';
import { SomeonePostedYourWorkQueryFragment$key } from '~/generated/SomeonePostedYourWorkQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import { removeNullValues } from '~/shared/relay/removeNullValues';

type SomeonePostedYourWorkProps = {
  queryRef: SomeonePostedYourWorkQueryFragment$key;
  notificationRef: SomeonePostedYourWorkFragment$key;
};

export function SomeonePostedYourWork({ notificationRef, queryRef }: SomeonePostedYourWorkProps) {
  const query = useFragment(
    graphql`
      fragment SomeonePostedYourWorkQueryFragment on Query {
        ...NotificationSkeletonQueryFragment
      }
    `,
    queryRef
  );

  const notification = useFragment(
    graphql`
      fragment SomeonePostedYourWorkFragment on SomeonePostedYourWorkNotification {
        __typename

        post {
          dbid
          author {
            username
            ...NotificationSkeletonResponsibleUsersFragment
          }
          tokens {
            definition {
              name
            }
          }
        }

        ...NotificationSkeletonFragment
      }
    `,
    notificationRef
  );

  const { post } = notification;
  const token = notification.post?.tokens?.[0];
  const postAuthor = notification.post?.author;

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const postAuthors = useMemo(() => {
    return removeNullValues([notification.post?.author]);
  }, [notification.post?.author]);

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
      responsibleUserRefs={postAuthors}
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
              shared your work
            </Typography>
          </Text>
        </View>

        <Text numberOfLines={2}>
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Bold',
            }}
            className="text-sm"
          >
            {token?.definition?.name}
          </Typography>
        </Text>
      </View>
    </NotificationSkeleton>
  );
}
