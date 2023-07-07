import { graphql, useFragment } from 'react-relay';

import { ProfilePictureFragment$key } from '~/generated/ProfilePictureFragment.graphql';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';

import { RawProfilePicture, RawProfilePictureProps } from '../RawProfilePicture';

type Props = {
  userRef: ProfilePictureFragment$key;
} & Omit<RawProfilePictureProps, 'imageUrl'>;

export function ProfilePicture({ userRef, ...rest }: Props) {
  const user = useFragment(
    graphql`
      fragment ProfilePictureFragment on GalleryUser {
        username
        profileImage {
          ... on TokenProfileImage {
            token {
              dbid
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
    return <RawProfilePicture imageUrl={profileImage.previewURLs.medium} {...rest} />;

  if (!token || token.dbid === 'unknown')
    return <RawProfilePicture letter={firstLetter} {...rest} />;

  const result = getVideoOrImageUrlForNftPreview({
    tokenRef: token,
    handleReportError: reportError,
  });

  if (!result) {
    return <RawProfilePicture letter={firstLetter} {...rest} />;
  }

  if (!result.urls.small) {
    throw new CouldNotRenderNftError('StagedNftImage', 'could not find a small url');
  }

  return <RawProfilePicture imageUrl={result.urls.small} {...rest} />;
}
