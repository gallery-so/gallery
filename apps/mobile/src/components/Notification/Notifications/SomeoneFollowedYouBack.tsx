import { Text } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { Typography } from '~/components/Typography';
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
    <Text className="text-sm">
      <Typography
        font={{
          family: 'ABCDiatype',
          weight: 'Bold',
        }}
        className="text-sm"
      >
        {count > 1 ? `${count} collectors` : `${lastFollower?.username ?? 'Someone'}`}
      </Typography>{' '}
      followed you back
    </Text>
  );
}
