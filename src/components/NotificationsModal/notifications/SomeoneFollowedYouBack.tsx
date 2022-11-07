import { SomeoneFollowedYouBackFragment$key } from '__generated__/SomeoneFollowedYouBackFragment.graphql';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { BaseM } from '~/components/core/Text/Text';

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
              username
            }
          }
        }
      }
    `,
    notificationRef
  );

  const count = notification.count ?? 1;
  const lastFollowersUsername = notification.followers?.edges?.[0]?.node?.username;

  return (
    <>
      <BaseM>
        <strong>
          {count > 1 ? <>{count} collectors</> : <>{lastFollowersUsername ?? 'Someone'}</>}
        </strong>{' '}
        followed you back
      </BaseM>
    </>
  );
}
