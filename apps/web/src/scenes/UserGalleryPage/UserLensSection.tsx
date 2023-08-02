import { graphql, useFragment } from 'react-relay';

import { HStack } from '~/components/core/Spacer/Stack';
import { ClickablePill } from '~/components/Pill';
import { UserLensSectionFragment$key } from '~/generated/UserLensSectionFragment.graphql';
import LensIcon from '~/icons/LensIcon';

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

  if (!lensUsername) {
    return null;
  }

  const lensUrl = `https://lenster.xyz/${lensUsername}`;

  return (
    <ClickablePill href={lensUrl}>
      <HStack gap={5} align="center">
        <LensIcon />
        <strong>{lensUsername}</strong>
      </HStack>
    </ClickablePill>
  );
}
