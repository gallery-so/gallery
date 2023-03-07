import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { BaseM } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { SomeoneFollowedYouFragment$key } from '~/generated/SomeoneFollowedYouFragment.graphql';

type SomeoneFollowedYouProps = {
  notificationRef: SomeoneFollowedYouFragment$key;
  onClose: () => void;
};

export function SomeoneFollowedYou({ notificationRef, onClose }: SomeoneFollowedYouProps) {
  const notification = useFragment(
    graphql`
      fragment SomeoneFollowedYouFragment on SomeoneFollowedYouNotification {
        count

        followers(last: 1) {
          edges {
            node {
              ...HoverCardOnUsernameFragment
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
    <BaseM>
      {count > 1 ? (
        <strong>{count} collectors</strong>
      ) : (
        <>
          {lastFollower ? (
            <HoverCardOnUsername userRef={lastFollower} onClick={onClose} />
          ) : (
            <strong>Someone</strong>
          )}
        </>
      )}{' '}
      followed you
    </BaseM>
  );
}
