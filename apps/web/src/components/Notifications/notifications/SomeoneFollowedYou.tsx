import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import FollowButton from '~/components/Follow/FollowButton';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { SomeoneFollowedYouFragment$key } from '~/generated/SomeoneFollowedYouFragment.graphql';
import { SomeoneFollowedYouQueryFragment$key } from '~/generated/SomeoneFollowedYouQueryFragment.graphql';

type SomeoneFollowedYouProps = {
  notificationRef: SomeoneFollowedYouFragment$key;
  queryRef: SomeoneFollowedYouQueryFragment$key;
  onClose: () => void;
};

export function SomeoneFollowedYou({
  notificationRef,
  queryRef,
  onClose,
}: SomeoneFollowedYouProps) {
  const notification = useFragment(
    graphql`
      fragment SomeoneFollowedYouFragment on SomeoneFollowedYouNotification {
        count

        followers(last: 1) {
          edges {
            node {
              ...FollowButtonUserFragment
              ...HoverCardOnUsernameFragment
              ...ProfilePictureFragment
            }
          }
        }
      }
    `,
    notificationRef
  );

  const query = useFragment(
    graphql`
      fragment SomeoneFollowedYouQueryFragment on Query {
        ...FollowButtonQueryFragment
      }
    `,
    queryRef
  );

  const count = notification.count ?? 1;
  const lastFollower = notification.followers?.edges?.[0]?.node;

  return (
    <StyledHStack justify="space-between">
      <HStack gap={4} align="center">
        {count > 1 ? (
          <BaseM>
            <strong>{count} collectors</strong>
          </BaseM>
        ) : (
          <>
            {lastFollower ? (
              <HStack gap={4} align="center">
                <ProfilePicture size="sm" userRef={lastFollower} />
                <HoverCardOnUsername userRef={lastFollower} onClick={onClose} />
              </HStack>
            ) : (
              <BaseM>
                <strong>Someone</strong>
              </BaseM>
            )}
          </>
        )}
        <BaseM>followed you</BaseM>
      </HStack>
      {count === 1 && lastFollower && (
        <HStack align="center">
          <FollowButton queryRef={query} userRef={lastFollower} />
        </HStack>
      )}
    </StyledHStack>
  );
}

const StyledHStack = styled(HStack)`
  width: 100%;
`;
