import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { SomeoneCommentedOnYourFeedEventFragment$key } from '__generated__/SomeoneCommentedOnYourFeedEventFragment.graphql';
import styled from 'styled-components';
import { BaseM } from 'components/core/Text/Text';
import { VStack } from 'components/core/Spacer/Stack';
import { CollectionLink } from 'components/NotificationBox/CollectionLink';

type SomeoneCommentedOnYourFeedEventProps = {
  notificationRef: SomeoneCommentedOnYourFeedEventFragment$key;
};

export function SomeoneCommentedOnYourFeedEvent({
  notificationRef,
}: SomeoneCommentedOnYourFeedEventProps) {
  const notification = useFragment(
    graphql`
      fragment SomeoneCommentedOnYourFeedEventFragment on SomeoneCommentedOnYourFeedEventNotification {
        __typename

        comment {
          commenter {
            username
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

  const commenterUsername = notification.comment?.commenter?.username;

  return (
    <VStack gap={8}>
      <BaseM>
        <strong>{commenterUsername ?? 'Someone'}</strong>
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
        <BaseM>{notification.comment?.comment}</BaseM>
      </CommentPreviewContainer>
    </VStack>
  );
}

const CommentPreviewContainer = styled.div`
  margin-left: 16px;
  padding-left: 8px;

  border-left: 2px solid #d9d9d9;
`;
