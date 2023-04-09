import { Text } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { Typography } from '~/components/Typography';
import { SomeoneFollowedYouFragment$key } from '~/generated/SomeoneFollowedYouFragment.graphql';

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
  const lastFollower = notification.followers?.edges?.[0]?.node;

  return (
    <Text>
      <Typography
        font={{
          family: 'ABCDiatype',
          weight: 'Bold',
        }}
      >
        {count > 1 ? (
          `
          ${count} collectors
        `
        ) : (
          <>{lastFollower ? lastFollower.username : 'Someone'}</>
        )}
      </Typography>{' '}
      followed you
    </Text>
  );
}
