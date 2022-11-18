import { SomeoneCommentedOnYourFeedEventFragment$key } from '__generated__/SomeoneCommentedOnYourFeedEventFragment.graphql';
import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { CollectionLink } from '~/components/NotificationsModal/CollectionLink';
import { SomeoneCommentedOnYourFeedEventQueryFragment$key } from '~/generated/SomeoneCommentedOnYourFeedEventQueryFragment.graphql';
import unescape from '~/utils/unescape';

type SomeoneCommentedOnYourFeedEventProps = {
  notificationRef: SomeoneCommentedOnYourFeedEventFragment$key;
  queryRef: SomeoneCommentedOnYourFeedEventQueryFragment$key;
};

export function SomeoneCommentedOnYourFeedEvent({
  notificationRef,
  queryRef,
}: SomeoneCommentedOnYourFeedEventProps) {
  const notification = useFragment(
    graphql`
      fragment SomeoneCommentedOnYourFeedEventFragment on SomeoneCommentedOnYourFeedEventNotification {
        __typename

        comment {
          commenter {
            ...HoverCardOnUsernameFragment
          }
          comment
        }

        feedEvent {
          eventData {
            ... on CollectionCreatedFeedEventData {
              __typename
              collection {
                ...CollectionLinkFragment
              }
            }

            ... on CollectorsNoteAddedToCollectionFeedEventData {
              __typename
              collection {
                ...CollectionLinkFragment
              }
            }

            ... on TokensAddedToCollectionFeedEventData {
              __typename
              collection {
                ...CollectionLinkFragment
              }
            }

            ... on CollectionUpdatedFeedEventData {
              __typename
              collection {
                ...CollectionLinkFragment
              }
            }
          }
        }
      }
    `,
    notificationRef
  );

  const query = useFragment(
    graphql`
      fragment SomeoneCommentedOnYourFeedEventQueryFragment on Query {
        ...HoverCardOnUsernameFollowFragment
      }
    `,
    queryRef
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

  // @ts-expect-error: property `collection` does not exist on type { readonly __typename: "%other" };
  const collection = notification.feedEvent?.eventData?.collection;

  return (
    <VStack gap={8}>
      <BaseM>
        <strong>
          {notification.comment?.commenter ? (
            <HoverCardOnUsername userRef={notification.comment?.commenter} queryRef={query} />
          ) : (
            'Someone'
          )}
        </strong>
        {` ${verb} `}
        {collection ? <CollectionLink collectionRef={collection} /> : <>your collection</>}
      </BaseM>

      <CommentPreviewContainer>
        <BaseM>{unescape(notification.comment?.comment ?? '')}</BaseM>
      </CommentPreviewContainer>
    </VStack>
  );
}

const CommentPreviewContainer = styled.div`
  margin-left: 16px;
  padding-left: 8px;

  border-left: 2px solid #d9d9d9;
`;
