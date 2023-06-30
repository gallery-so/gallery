import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { CollectionLink } from '~/components/Notifications/CollectionLink';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { SomeoneCommentedOnYourFeedEventFragment$key } from '~/generated/SomeoneCommentedOnYourFeedEventFragment.graphql';
import unescape from '~/shared/utils/unescape';

type SomeoneCommentedOnYourFeedEventProps = {
  notificationRef: SomeoneCommentedOnYourFeedEventFragment$key;
  onClose: () => void;
  isPfpVisible: boolean;
};

export function SomeoneCommentedOnYourFeedEvent({
  notificationRef,
  onClose,
  isPfpVisible,
}: SomeoneCommentedOnYourFeedEventProps) {
  const notification = useFragment(
    graphql`
      fragment SomeoneCommentedOnYourFeedEventFragment on SomeoneCommentedOnYourFeedEventNotification {
        __typename

        comment {
          commenter {
            ...HoverCardOnUsernameFragment
            ...ProfilePictureFragment
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
        {notification.comment?.commenter ? (
          <HStack align="center" gap={4} inline>
            {isPfpVisible && <ProfilePicture size="sm" userRef={notification.comment?.commenter} />}
            <HoverCardOnUsername userRef={notification.comment?.commenter} onClick={onClose} />
          </HStack>
        ) : (
          <strong>Someone</strong>
        )}
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
