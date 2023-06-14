import { graphql, useFragment } from 'react-relay';

import { ProfilePictureFragment$key } from '~/generated/ProfilePictureFragment.graphql';

import { RawProfilePicture } from '../RawProfilePicture';

type Props = {
  userRef: ProfilePictureFragment$key;
};

export function ProfilePicture({ userRef }: Props) {
  const user = useFragment(
    graphql`
      fragment ProfilePictureFragment on GalleryUser {
        username
      }
    `,
    userRef
  );

  if (!user) return null;

  const firstLetter = user?.username?.substring(0, 1) ?? '';

  return <RawProfilePicture letter={firstLetter} hasInset isEditable size="lg" />;
}
