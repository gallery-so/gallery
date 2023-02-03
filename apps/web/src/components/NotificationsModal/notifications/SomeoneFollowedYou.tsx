import { SomeoneFollowedYouFragment$key } from '__generated__/SomeoneFollowedYouFragment.graphql';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { BaseM } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { SomeoneFollowedYouQueryFragment$key } from '~/generated/SomeoneFollowedYouQueryFragment.graphql';

type SomeoneFollowedYouProps = {
  notificationRef: SomeoneFollowedYouFragment$key;
  queryRef: SomeoneFollowedYouQueryFragment$key;
};

export function SomeoneFollowedYou({ notificationRef, queryRef }: SomeoneFollowedYouProps) {
  const query = useFragment(
    graphql`
      fragment SomeoneFollowedYouQueryFragment on Query {
        ...HoverCardOnUsernameFollowFragment
      }
    `,
    queryRef
  );

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
            <HoverCardOnUsername userRef={lastFollower} queryRef={query} />
          ) : (
            <strong>Someone</strong>
          )}
        </>
      )}{' '}
      followed you
    </BaseM>
  );
}
