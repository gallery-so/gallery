import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { SomeoneFollowedYouFragment$key } from '~/generated/SomeoneFollowedYouFragment.graphql';

type SomeoneFollowedYouProps = {
  notificationRef: SomeoneFollowedYouFragment$key;
  onClose: () => void;
  isPfpVisible: boolean;
};

export function SomeoneFollowedYou({
  notificationRef,
  onClose,
  isPfpVisible,
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
    notificationRef
  );

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
              {isPfpVisible && <ProfilePicture size="sm" userRef={lastFollower} />}
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
    </HStack>
  );
}
