import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { Text } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NotificationSkeleton } from '~/components/Notification/NotificationSkeleton';
import { Typography } from '~/components/Typography';
import { SomeoneAdmiredYourFeedEventFragment$key } from '~/generated/SomeoneAdmiredYourFeedEventFragment.graphql';
import { SomeoneAdmiredYourFeedEventQueryFragment$key } from '~/generated/SomeoneAdmiredYourFeedEventQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { removeNullValues } from '~/shared/relay/removeNullValues';

type SomeoneAdmiredYourFeedEventProps = {
  queryRef: SomeoneAdmiredYourFeedEventQueryFragment$key;
  notificationRef: SomeoneAdmiredYourFeedEventFragment$key;
};

export function SomeoneAdmiredYourFeedEvent({
  notificationRef,
  queryRef,
}: SomeoneAdmiredYourFeedEventProps) {
  const query = useFragment(
    graphql`
      fragment SomeoneAdmiredYourFeedEventQueryFragment on Query {
        ...NotificationSkeletonQueryFragment
      }
    `,
    queryRef
  );

  const notification = useFragment(
    graphql`
      fragment SomeoneAdmiredYourFeedEventFragment on SomeoneAdmiredYourFeedEventNotification {
        count

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

        admirers(last: 1) {
          edges {
            node {
              __typename
              username

              ...NotificationSkeletonResponsibleUsersFragment
            }
          }
        }

        ...NotificationSkeletonFragment
      }
    `,
    notificationRef
  );

  const admirers = useMemo(() => {
    return removeNullValues(notification.admirers?.edges?.map((edge) => edge?.node));
  }, [notification.admirers?.edges]);

  const count = notification.count ?? 1;
  const firstAdmirer = admirers[0];
  const eventType = notification.feedEvent?.eventData?.__typename;

  const verb = useMemo(() => {
    switch (eventType) {
      case 'CollectionCreatedFeedEventData':
      case 'TokensAddedToCollectionFeedEventData':
        return 'admired your additions to';
      case 'CollectorsNoteAddedToCollectionFeedEventData':
        return 'admired your note on';
      case 'CollectionUpdatedFeedEventData':
        return 'admired your updates to';
      default:
        return 'admired your updates to';
    }
  }, [eventType]);

  const collection =
    notification.feedEvent?.eventData && 'collection' in notification.feedEvent?.eventData
      ? notification.feedEvent?.eventData?.collection
      : null;

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
      responsibleUserRefs={admirers}
      notificationRef={notification}
    >
      <Text>
        <Typography
          font={{
            family: 'ABCDiatype',
            weight: 'Bold',
          }}
          className="text-sm"
        >
          {count > 1
            ? `${notification.count} collectors`
            : firstAdmirer
            ? firstAdmirer?.username
            : 'Someone'}
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
        )}
      </Text>
    </NotificationSkeleton>
  );
}
