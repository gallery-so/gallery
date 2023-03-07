import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { BaseM } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { SomeoneFollowedYouBackFragment$key } from '~/generated/SomeoneFollowedYouBackFragment.graphql';

type SomeoneFollowedYouBackProps = {
  notificationRef: SomeoneFollowedYouBackFragment$key;
};

export function SomeoneFollowedYouBack({ notificationRef }: SomeoneFollowedYouBackProps) {
  const notification = useFragment(
    graphql`
      fragment SomeoneFollowedYouBackFragment on SomeoneFollowedYouBackNotification {
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
          {lastFollower ? <HoverCardOnUsername userRef={lastFollower} /> : <strong>Someone</strong>}
        </>
      )}{' '}
      followed you back
    </BaseM>
  );
}
