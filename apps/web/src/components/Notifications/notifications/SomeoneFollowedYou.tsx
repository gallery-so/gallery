import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { SomeoneFollowedYouFragment$key } from '~/generated/SomeoneFollowedYouFragment.graphql';
import FollowButton from '~/components/Follow/FollowButton';

type SomeoneFollowedYouProps = {
  notificationRef: SomeoneFollowedYouFragment$key;
  queryRef: SomeoneFollowedYouQueryFragment$key;
  onClose: () => void;
};

export function SomeoneFollowedYou({
  notificationRef,
  onClose,
  queryRef,
}: SomeoneFollowedYouProps) {
  const notification = useFragment(
    graphql`
      fragment SomeoneFollowedYouFragment on SomeoneFollowedYouNotification {
        count

        followers(last: 1) {
          edges {
            node {
              ...HoverCardOnUsernameFragment
              ...ProfilePictureFragment
            }
          }
        }
      }
    `,
    notificationRef,
  );

  const query = useFragment(graphql`
    fragment SomeoneFollowedYouQueryFragment on Query {
      ...FollowButtonQueryFragment
    }
  `, queryRef);

  const count = notification.count ?? 1;
  const lastFollower = notification.followers?.edges?.[0]?.node;

  return (
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
      )}{' '}
      <BaseM>followed you</BaseM>
      <FollowButton queryRef={query} userRef={lastFollower} />
    </HStack>
  );
}
