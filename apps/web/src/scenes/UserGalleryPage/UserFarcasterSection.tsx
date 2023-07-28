import { graphql, useFragment } from 'react-relay';

import { HStack } from '~/components/core/Spacer/Stack';
import { ClickablePill } from '~/components/Pill';
import { UserFarcasterSectionFragment$key } from '~/generated/UserFarcasterSectionFragment.graphql';
import FarcasterIcon from '~/icons/FarcasterIcon';

type Props = {
  userRef: UserFarcasterSectionFragment$key;
};

export default function UserFarcasterSection({ userRef }: Props) {
  const user = useFragment(
    graphql`
      fragment UserFarcasterSectionFragment on GalleryUser {
        socialAccounts {
          farcaster {
            username
          }
        }
      }
    `,
    userRef
  );

  const farcasterUsername = user.socialAccounts?.farcaster?.username;

  if (!farcasterUsername) {
    return null;
  }

  const farcasterUrl = `https://warpcast.com/${farcasterUsername}`;

  return (
    <ClickablePill href={farcasterUrl}>
      <HStack gap={5} align="center">
        <FarcasterIcon />
        <strong>{farcasterUsername}</strong>
      </HStack>
    </ClickablePill>
  );
}
