import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { NotificationSkeleton } from '~/components/Notification/NotificationSkeleton';
import { Typography } from '~/components/Typography';
import { SomeonePostedYourWorkFragment$key } from '~/generated/SomeonePostedYourWorkFragment$key.graphql';
import { SomeonePostedYourWorkQueryFragment$key } from '~/generated/SomeonePostedYourWorkQueryFragment$key.graphql';
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
            name
          }
        }

        ...NotificationSkeletonFragment
      }
    `,
    notificationRef
  );

  const { post } = notification;
  const postToken = notification.post?.tokens?.[0];

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const postAuthors = useMemo(() => {
    return removeNullValues([notification.post?.author]);
  }, [notification.post?.author]);

  const handlePress = useCallback(() => {
    if (post?.dbid) {
      navigation.navigate('Post', { postId: post.dbid });
    }
  }, [navigation, post?.dbid]);

  const postAuthor = notification.post.author;

  const handleUserPress = useCallback(() => {
    navigation.navigate('Profile', { username: postAuthor.username });
  }, [navigation, postAuthor.username]);

  return (
    <NotificationSkeleton
      queryRef={query}
      onPress={handlePress}
      notificationRef={notification}
      responsibleUserRefs={postAuthors}
    >
      <View className="flex pt-2">
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
              shared your
            </Typography>{' '}
            <Typography
              font={{
                family: 'ABCDiatype',
                weight: 'Bold',
              }}
              className="text-sm"
            >
              work
            </Typography>
          </Text>
        </View>

        <Text>
          <Typography
            font={{
              family: 'ABCDiatype',
              weight: 'Bold',
            }}
            className="text-sm"
          >
            {postToken.name}
          </Typography>
        </Text>
      </View>
    </NotificationSkeleton>
  );
}
