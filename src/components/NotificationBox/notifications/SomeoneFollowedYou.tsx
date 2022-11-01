import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { SomeoneFollowedYouFragment$key } from '__generated__/SomeoneFollowedYouFragment.graphql';
import { BaseM } from 'components/core/Text/Text';

type SomeoneFollowedYouProps = {
  notificationRef: SomeoneFollowedYouFragment$key;
};

export function SomeoneFollowedYou({ notificationRef }: SomeoneFollowedYouProps) {
  const notification = useFragment(
    graphql`
      fragment SomeoneFollowedYouFragment on SomeoneFollowedYouNotification {
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
        followed you
      </BaseM>
    </>
  );
}
