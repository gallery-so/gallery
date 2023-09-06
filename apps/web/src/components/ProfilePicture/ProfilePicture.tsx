import Link from 'next/link';
import { Route } from 'nextjs-routes';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { ProfilePictureFragment$key } from '~/generated/ProfilePictureFragment.graphql';
import { ProfilePictureValidFragment$key } from '~/generated/ProfilePictureValidFragment.graphql';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';

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
              ...ProfilePictureValidFragment
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

  const userProfileLink = useMemo((): Route => {
    return { pathname: '/[username]', query: { username: user.username as string } };
  }, [user]);

  if (!user) return null;

  const { token, profileImage } = user.profileImage ?? {};

  const firstLetter = user?.username?.substring(0, 1) ?? '';

  if (profileImage && profileImage.previewURLs?.medium) {
    return (
      <StyledLink href={userProfileLink}>
        <RawProfilePicture imageUrl={profileImage.previewURLs.medium} {...rest} />
      </StyledLink>
    );
  }

  if (!token) {
    return (
      <StyledLink href={userProfileLink}>
        <RawProfilePicture letter={firstLetter} {...rest} />
      </StyledLink>
    );
  }

  return (
    <StyledLink href={userProfileLink}>
      <ValidProfilePicture tokenRef={token} {...rest} />
    </StyledLink>
  );
}

type ValidProfilePictureProps = {
  tokenRef: ProfilePictureValidFragment$key;
} & Omit<RawProfilePictureProps, 'imageUrl'>;

function ValidProfilePicture({ tokenRef, ...rest }: ValidProfilePictureProps) {
  const token = useFragment(
    graphql`
      fragment ProfilePictureValidFragment on Token {
        ...useGetPreviewImagesSingleFragment
      }
    `,
    tokenRef
  );

  const imageUrl = useGetSinglePreviewImage({ tokenRef: token, size: 'small' });

  if (!imageUrl) {
    throw new CouldNotRenderNftError('ProfilePicture', 'could not find a small url');
  }

  return <RawProfilePicture imageUrl={imageUrl} {...rest} />;
}

const StyledLink = styled(Link)`
  text-decoration: none;
  cursor: pointer;
`;
