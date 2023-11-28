import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NotificationSkeleton } from '~/components/Notification/NotificationSkeleton';
import { Typography } from '~/components/Typography';
import { SomeoneCommentedOnYourFeedEventFragment$key } from '~/generated/SomeoneCommentedOnYourFeedEventFragment.graphql';
import { SomeoneCommentedOnYourFeedEventQueryFragment$key } from '~/generated/SomeoneCommentedOnYourFeedEventQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { getTimeSince } from '~/shared/utils/time';

type SomeoneCommentedOnYourFeedEventProps = {
  queryRef: SomeoneCommentedOnYourFeedEventQueryFragment$key;
  notificationRef: SomeoneCommentedOnYourFeedEventFragment$key;
};

export function SomeoneCommentedOnYourFeedEvent({
  queryRef,
  notificationRef,
}: SomeoneCommentedOnYourFeedEventProps) {
  const query = useFragment(
    graphql`
      fragment SomeoneCommentedOnYourFeedEventQueryFragment on Query {
        ...NotificationSkeletonQueryFragment
      }
    `,
    queryRef
  );

  const notification = useFragment(
    graphql`
      fragment SomeoneCommentedOnYourFeedEventFragment on SomeoneCommentedOnYourFeedEventNotification {
        __typename
        updatedTime

        comment {
          commenter {
            username
            ...NotificationSkeletonResponsibleUsersFragment
          }
          comment
        }

        feedEvent {
          dbid
          eventData {
            ... on CollectionCreatedFeedEventData {
              __typename
              collection {
                __typename
                name
              }
            }

            ... on CollectorsNoteAddedToCollectionFeedEventData {
              __typename
              collection {
                __typename
                name
              }
            }

            ... on TokensAddedToCollectionFeedEventData {
              __typename
              collection {
                __typename
                name
              }
            }

            ... on CollectionUpdatedFeedEventData {
              __typename
              collection {
                __typename
                name
              }
            }
          }
        }

        ...NotificationSkeletonFragment
      }
    `,
    notificationRef
  );

  const eventType = notification.feedEvent?.eventData?.__typename;

  const verb = useMemo(() => {
    switch (eventType) {
      case 'CollectionCreatedFeedEventData':
      case 'TokensAddedToCollectionFeedEventData':
        return 'commented on your additions to';
      case 'CollectorsNoteAddedToCollectionFeedEventData':
        return 'commented on your note on';
      case 'CollectionUpdatedFeedEventData':
        return 'commented on your updates to';
      default:
        return 'commented on your updates to';
    }
  }, [eventType]);

  const commenters = useMemo(() => {
    return removeNullValues([notification.comment?.commenter]);
  }, [notification.comment?.commenter]);

  // @ts-expect-error: property `collection` does not exist on type { readonly __typename: "%other" };
  const collection = notification.feedEvent?.eventData?.collection;
  const commenter = notification.comment?.commenter;

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handlePress = useCallback(() => {
    if (notification.feedEvent?.dbid) {
      navigation.navigate('FeedEvent', { eventId: notification.feedEvent?.dbid });
    }
  }, [navigation, notification.feedEvent?.dbid]);

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
          </Typography>
          {` ${verb} `}
          {collection ? (
            <Typography
              font={{
                family: 'ABCDiatype',
                weight: 'Bold',
              }}
              className="text-sm underline"
            >
              {collection.name}
            </Typography>
          ) : (
            <Text>your collection</Text>
          )}{' '}
          <Typography
            className="text-metal text-xs"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            {getTimeSince(notification.updatedTime)}
          </Typography>
        </Text>
        <View className="border-l-2 border-[#d9d9d9] pl-2">
          <Text className="dark:text-white">{notification.comment?.comment ?? ''}</Text>
        </View>
      </View>
    </NotificationSkeleton>
  );
}
