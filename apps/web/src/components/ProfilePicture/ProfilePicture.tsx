import Link from 'next/link';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { useMemo } from 'react';

import { ProfilePictureFragment$key } from '~/generated/ProfilePictureFragment.graphql';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';

import { RawProfilePicture, RawProfilePictureProps } from './RawProfilePicture';

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
    userRef,
  );

  const userProfileLink = useMemo((): Route => {
    return { pathname: '/[username]', query: { username: user.username as string } };
  }, [user]);

  if (!user) return null;

  const { token, profileImage } = user.profileImage ?? {};

  const firstLetter = user?.username?.substring(0, 1) ?? '';

  if (profileImage && profileImage.previewURLs?.medium)
    return (
      <StyledLink href={userProfileLink}>
        <RawProfilePicture imageUrl={profileImage.previewURLs.medium} {...rest} />
      </StyledLink>
    );

  if (!token)
    return (
      <StyledLink href={userProfileLink}>
        <RawProfilePicture letter={firstLetter} {...rest} />
      </StyledLink>
    );

  const result = getVideoOrImageUrlForNftPreview({
    tokenRef: token,
    handleReportError: reportError,
  });

  if (!result) {
    throw new CouldNotRenderNftError(
      'StatedNftImage',
      'could not compute getVideoOrImageUrlForNftPreview',
    );
  }

  if (!result.urls.small) {
    throw new CouldNotRenderNftError('StagedNftImage', 'could not find a small url');
  }

  return (
    <StyledLink href={userProfileLink}>
      <RawProfilePicture imageUrl={result.urls.small} {...rest} />
    </StyledLink>
  );
}

const StyledLink = styled(Link)`
  text-decoration: none;
  cursor: pointer;
`;
