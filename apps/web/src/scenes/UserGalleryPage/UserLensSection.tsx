import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { UserLensSectionFragment$key } from '~/generated/UserLensSectionFragment.graphql';
import LensIcon from '~/icons/LensIcon';

import UserSocialPill from './UserSocialPill';

type Props = {
  userRef: UserLensSectionFragment$key;
};

export default function UserLensSection({ userRef }: Props) {
  const user = useFragment(
    graphql`
      fragment UserLensSectionFragment on GalleryUser {
        socialAccounts {
          lens {
            username
          }
        }
      }
    `,
    userRef
  );

  const lensUsername = user.socialAccounts?.lens?.username;

  const rawLensUsername = useMemo(
    () => (lensUsername?.endsWith('.lens') ? lensUsername.slice(0, -5) : lensUsername),
    [lensUsername]
  );

  if (!lensUsername || !rawLensUsername) {
    return null;
  }

  const lensUrl = `https://lenster.xyz/u/${rawLensUsername}`;

  return (
    <UserSocialPill url={lensUrl} icon={<LensIcon />} username={rawLensUsername} platform="lens" />
  );
}
