import { graphql, useFragment } from 'react-relay';

import { ProfilePictureFragment$key } from '~/generated/ProfilePictureFragment.graphql';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';

import { RawProfilePicture } from '../RawProfilePicture';

type Props = {
  userRef: ProfilePictureFragment$key;
};

export function ProfilePicture({ userRef }: Props) {
  const user = useFragment(
    graphql`
      fragment ProfilePictureFragment on GalleryUser {
        username
        profileImage {
          ... on TokenProfileImage {
            token {
              ...getVideoOrImageUrlForNftPreviewFragment
            }
          }
          ... on EnsProfileImage {
            __typename
            profileImage {
              __typename
              previewURLs {
                medium
              }
            }
          }
        }
      }
    `,
    userRef
  );

  if (!user) return null;

  const { token, profileImage } = user.profileImage ?? {};

  const firstLetter = user?.username?.substring(0, 1) ?? '';

  if (profileImage && profileImage.previewURLs?.medium)
    return (
      <RawProfilePicture imageUrl={profileImage.previewURLs.medium} hasInset isEditable size="xl" />
    );

  if (!token) return <RawProfilePicture letter={firstLetter} hasInset isEditable size="xl" />;

  const result = getVideoOrImageUrlForNftPreview({
    tokenRef: token,
    handleReportError: reportError,
  });

  if (!result) {
    throw new CouldNotRenderNftError(
      'StatedNftImage',
      'could not compute getVideoOrImageUrlForNftPreview'
    );
  }

  if (!result.urls.small) {
    throw new CouldNotRenderNftError('StagedNftImage', 'could not find a small url');
  }

  return <RawProfilePicture imageUrl={result.urls.small} hasInset isEditable size="xl" />;
}
