import { SomeoneCommentedOnYourFeedEventFragment$key } from '__generated__/SomeoneCommentedOnYourFeedEventFragment.graphql';
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

  return (
    <VStack gap={8}>
      <BaseM>
        <strong>
          {notification.comment?.commenter ? (
            <HoverCardOnUsername userRef={notification.comment?.commenter} queryRef={query} />
          ) : (
            'Someone'
          )}{' '}
        </strong>
        {notification.feedEvent?.eventData?.collection ? (
          <>
            commented on your additions to{' '}
            <CollectionLink collectionRef={notification.feedEvent.eventData.collection} />
          </>
        ) : (
          <>commented on your additions to one of your collections</>
        )}
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
