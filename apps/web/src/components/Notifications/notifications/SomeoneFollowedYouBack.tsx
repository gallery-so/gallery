import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { SomeoneFollowedYouBackFragment$key } from '~/generated/SomeoneFollowedYouBackFragment.graphql';

type SomeoneFollowedYouBackProps = {
  notificationRef: SomeoneFollowedYouBackFragment$key;
  onClose: () => void;
  isPfpVisible: boolean;
};

export function SomeoneFollowedYouBack({
  notificationRef,
  onClose,
  isPfpVisible,
}: SomeoneFollowedYouBackProps) {
  const notification = useFragment(
    graphql`
      fragment SomeoneFollowedYouBackFragment on SomeoneFollowedYouBackNotification {
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
    <HStack align="center" gap={4}>
      {count > 1 ? (
        <BaseM>
          <strong>{count} collectors</strong>
        </BaseM>
      ) : (
        <>
          {lastFollower ? (
            <HStack align="center" gap={4} inline>
              {isPfpVisible && <ProfilePicture size="sm" userRef={lastFollower} />}
              <HoverCardOnUsername userRef={lastFollower} onClick={onClose} />
            </HStack>
          ) : (
            <strong>Someone</strong>
          )}
        </>
      )}{' '}
      <BaseM>followed you back</BaseM>
    </HStack>
  );
}
