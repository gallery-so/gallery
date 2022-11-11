import { SomeoneAdmiredYourFeedEventFragment$key } from '__generated__/SomeoneAdmiredYourFeedEventFragment.graphql';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { BaseM } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { CollectionLink } from '~/components/NotificationsModal/CollectionLink';
import { SomeoneAdmiredYourFeedEventQueryFragment$key } from '~/generated/SomeoneAdmiredYourFeedEventQueryFragment.graphql';

type SomeoneAdmiredYourFeedEventProps = {
  notificationRef: SomeoneAdmiredYourFeedEventFragment$key;
  queryRef: SomeoneAdmiredYourFeedEventQueryFragment$key;
};

export function SomeoneAdmiredYourFeedEvent({
  notificationRef,
  queryRef,
}: SomeoneAdmiredYourFeedEventProps) {
  const query = useFragment(
    graphql`
      fragment SomeoneAdmiredYourFeedEventQueryFragment on Query {
        ...HoverCardOnUsernameFollowFragment
      }
    `,
    queryRef
  );

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
              ...HoverCardOnUsernameFragment
            }
          }
        }
      }
    `,
    notificationRef
  );

  const count = notification.count ?? 1;
  const firstAdmirer = notification.admirers?.edges?.[0]?.node;

  return (
    <BaseM>
      <strong>
        {count > 1 ? (
          <>{notification.count} collectors</>
        ) : (
          <>
            {firstAdmirer ? (
              <HoverCardOnUsername userRef={firstAdmirer} queryRef={query} />
            ) : (
              'Someone'
            )}
          </>
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
  );
}
