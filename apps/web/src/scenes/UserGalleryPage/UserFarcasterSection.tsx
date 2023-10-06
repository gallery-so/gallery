import { graphql, useFragment } from 'react-relay';

import { UserFarcasterSectionFragment$key } from '~/generated/UserFarcasterSectionFragment.graphql';
import FarcasterIcon from '~/icons/FarcasterIcon';

import UserSocialPill from './UserSocialPill';

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
    <UserSocialPill
      url={farcasterUrl}
      icon={<FarcasterIcon />}
      username={farcasterUsername}
      platform="farcaster"
    />
  );
}
