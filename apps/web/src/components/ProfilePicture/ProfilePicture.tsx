import { Route } from 'nextjs-routes';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { ProfilePictureFragment$key } from '~/generated/ProfilePictureFragment.graphql';
import { ProfilePictureValidFragment$key } from '~/generated/ProfilePictureValidFragment.graphql';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';

import InteractiveLink from '../core/InteractiveLink/InteractiveLink';
import { NftFailureBoundary } from '../NftFailureFallback/NftFailureBoundary';
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
              dbid
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
      <InteractiveLink to={userProfileLink}>
        <RawProfilePicture imageUrl={profileImage.previewURLs.medium} {...rest} />
      </InteractiveLink>
    );
  }

  if (!token) {
    return (
      <InteractiveLink to={userProfileLink}>
        <RawProfilePicture letter={firstLetter} {...rest} />
      </InteractiveLink>
    );
  }

  return (
    <InteractiveLink to={userProfileLink}>
      <NftFailureBoundary
        tokenId={token.dbid}
        fallback={<RawProfilePicture letter={firstLetter} {...rest} />}
        loadingFallback={<RawProfilePicture letter={firstLetter} {...rest} />}
      >
        <ValidProfilePicture tokenRef={token} {...rest} />
      </NftFailureBoundary>
    </InteractiveLink>
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

  const imageUrl = useGetSinglePreviewImage({ tokenRef: token, size: 'small' }) ?? '';

  return <RawProfilePicture imageUrl={imageUrl} {...rest} />;
}
