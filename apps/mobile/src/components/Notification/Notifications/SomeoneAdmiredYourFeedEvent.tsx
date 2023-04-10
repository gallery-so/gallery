import { useMemo } from 'react';
import { Text } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { Typography } from '~/components/Typography';
import { SomeoneAdmiredYourFeedEventFragment$key } from '~/generated/SomeoneAdmiredYourFeedEventFragment.graphql';

type SomeoneAdmiredYourFeedEventProps = {
  notificationRef: SomeoneAdmiredYourFeedEventFragment$key;
};

export function SomeoneAdmiredYourFeedEvent({ notificationRef }: SomeoneAdmiredYourFeedEventProps) {
  const notification = useFragment(
    graphql`
      fragment SomeoneAdmiredYourFeedEventFragment on SomeoneAdmiredYourFeedEventNotification {
        count

        feedEvent {
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
            }
          }
        }
      }
    `,
    notificationRef
  );

  const count = notification.count ?? 1;
  const firstAdmirer = notification.admirers?.edges?.[0]?.node;
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

  // @ts-expect-error: property `collection` does not exist on type { readonly __typename: "%other" };
  const collection = notification.feedEvent?.eventData?.collection;

  return (
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
  );
}
