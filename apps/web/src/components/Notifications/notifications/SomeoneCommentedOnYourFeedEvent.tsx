import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM, BaseS } from '~/components/core/Text/Text';
import UserHoverCard from '~/components/HoverCard/UserHoverCard';
import { CollectionLink } from '~/components/Notifications/CollectionLink';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { SomeoneCommentedOnYourFeedEventFragment$key } from '~/generated/SomeoneCommentedOnYourFeedEventFragment.graphql';
import colors from '~/shared/theme/colors';
import { getTimeSince } from '~/shared/utils/time';
import unescape from '~/shared/utils/unescape';

type SomeoneCommentedOnYourFeedEventProps = {
  notificationRef: SomeoneCommentedOnYourFeedEventFragment$key;
  onClose: () => void;
};

export function SomeoneCommentedOnYourFeedEvent({
  notificationRef,
  onClose,
}: SomeoneCommentedOnYourFeedEventProps) {
  const notification = useFragment(
    graphql`
      fragment SomeoneCommentedOnYourFeedEventFragment on SomeoneCommentedOnYourFeedEventNotification {
        __typename
        updatedTime

        comment {
          commenter {
            ...UserHoverCardFragment
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
  const timeAgo = getTimeSince(notification.updatedTime);

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
          <>
            <StyledProfilePictureContainer>
              <ProfilePicture size="md" userRef={notification.comment?.commenter} />
            </StyledProfilePictureContainer>

            <UserHoverCard userRef={notification.comment?.commenter} onClick={onClose} />
          </>
        ) : (
          <strong>Someone</strong>
        )}
        {` ${verb} `}
        {collection ? <CollectionLink collectionRef={collection} /> : <>your collection</>}
      </BaseM>
      &nbsp;
      <TimeAgoText as="span">{timeAgo}</TimeAgoText>
      <CommentPreviewContainer>
        <BaseM>{unescape(notification.comment?.comment ?? '')}</BaseM>
      </CommentPreviewContainer>
    </VStack>
  );
}

const TimeAgoText = styled(BaseS)`
  color: ${colors.metal};
  white-space: nowrap;
  flex-shrink: 0;
`;

const CommentPreviewContainer = styled.div`
  margin-left: 16px;
  padding-left: 8px;

  border-left: 2px solid #d9d9d9;
`;

const StyledProfilePictureContainer = styled.div`
  display: inline-block;
  padding-right: 8px;
`;
