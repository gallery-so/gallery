import { SomeoneAdmiredYourFeedEventFragment$key } from '__generated__/SomeoneAdmiredYourFeedEventFragment.graphql';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { BaseM } from '~/components/core/Text/Text';
import { CollectionLink } from '~/components/NotificationsModal/CollectionLink';

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
              collection {
                ...CollectionLinkFragment
              }
            }

            ... on CollectorsNoteAddedToCollectionFeedEventData {
              collection {
                ...CollectionLinkFragment
              }
            }

            ... on TokensAddedToCollectionFeedEventData {
              collection {
                ...CollectionLinkFragment
              }
            }
          }
        }

        admirers(last: 1) {
          edges {
            node {
              username
            }
          }
        }
      }
    `,
    notificationRef
  );

  const count = notification.count ?? 1;
  const firstAdmirerUsername = notification.admirers?.edges?.[0]?.node?.username;

  return (
    <>
      <BaseM>
        <strong>
          {count > 1 ? (
            <>{notification.count} collectors</>
          ) : (
            <>{firstAdmirerUsername ?? 'Someone'}</>
          )}
        </strong>{' '}
        {notification.feedEvent?.eventData?.collection ? (
          <>
            <CollectionLink collectionRef={notification.feedEvent.eventData.collection} />
          </>
        ) : (
          <>admired your additions to one of your collections</>
        )}
      </BaseM>
    </>
  );
}
