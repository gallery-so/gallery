import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { BaseM } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { SomeoneFollowedYouBackFragment$key } from '~/generated/SomeoneFollowedYouBackFragment.graphql';
import { SomeoneFollowedYouBackQueryFragment$key } from '~/generated/SomeoneFollowedYouBackQueryFragment.graphql';

type SomeoneFollowedYouBackProps = {
  notificationRef: SomeoneFollowedYouBackFragment$key;
  queryRef: SomeoneFollowedYouBackQueryFragment$key;
  onClose: () => void;
};

export function SomeoneFollowedYouBack({
  notificationRef,
  queryRef,
  onClose,
}: SomeoneFollowedYouBackProps) {
  const query = useFragment(
    graphql`
      fragment SomeoneFollowedYouBackQueryFragment on Query {
        ...HoverCardOnUsernameFollowFragment
      }
    `,
    queryRef
  );

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
          {lastFollower ? (
            <HoverCardOnUsername userRef={lastFollower} queryRef={query} onClick={onClose} />
          ) : (
            <strong>Someone</strong>
          )}
        </>
      )}{' '}
      followed you back
    </BaseM>
  );
}
