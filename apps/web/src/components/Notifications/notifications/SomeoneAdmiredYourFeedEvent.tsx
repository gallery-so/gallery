import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { BaseM } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { CollectionLink } from '~/components/Notifications/CollectionLink';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { SomeoneAdmiredYourFeedEventFragment$key } from '~/generated/SomeoneAdmiredYourFeedEventFragment.graphql';

type SomeoneAdmiredYourFeedEventProps = {
  notificationRef: SomeoneAdmiredYourFeedEventFragment$key;
  onClose: () => void;
  isPfpVisible: boolean;
};

export function SomeoneAdmiredYourFeedEvent({
  notificationRef,
  onClose,
  isPfpVisible,
}: SomeoneAdmiredYourFeedEventProps) {
  const notification = useFragment(
    graphql`
      fragment SomeoneAdmiredYourFeedEventFragment on SomeoneAdmiredYourFeedEventNotification {
        count

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

        admirers(last: 1) {
          edges {
            node {
              ...HoverCardOnUsernameFragment
              ...ProfilePictureFragment
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

  const collection =
    notification.feedEvent?.eventData && 'collection' in notification.feedEvent?.eventData
      ? notification.feedEvent?.eventData?.collection
      : null;

  return (
    <BaseM>
      {count > 1 ? (
        <BaseM>
          <strong>{notification.count} collectors</strong>
        </BaseM>
      ) : (
        <>
          {firstAdmirer ? (
            <>
              {isPfpVisible && (
                <StyledProfilePictureContainer>
                  <ProfilePicture size="sm" userRef={firstAdmirer} />
                </StyledProfilePictureContainer>
              )}
              <HoverCardOnUsername userRef={firstAdmirer} onClick={onClose} />
            </>
          ) : (
            <BaseM as="span">
              <strong>Someone</strong>
            </BaseM>
          )}
        </>
      )}
      <BaseM as="span">{` ${verb} `}</BaseM>
      {collection ? <CollectionLink collectionRef={collection} /> : <BaseM>your collection</BaseM>}
    </BaseM>
  );
}

const StyledProfilePictureContainer = styled.div`
  display: inline-block;
  padding-right: 4px;
`;
