import { Route } from 'nextjs-routes';
import { PropsWithChildren, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { ProfilePictureFragment$key } from '~/generated/ProfilePictureFragment.graphql';
import { ProfilePictureValidFragment$key } from '~/generated/ProfilePictureValidFragment.graphql';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';

import GalleryLink from '../core/GalleryLink/GalleryLink';
import { NftFailureBoundary } from '../NftFailureFallback/NftFailureBoundary';
import { RawProfilePicture, RawProfilePictureProps } from './RawProfilePicture';

type Props = {
  userRef: ProfilePictureFragment$key;
  clickDisabled?: boolean;
} & Omit<RawProfilePictureProps, 'imageUrl'>;

function PfpLinkWrapper({ userRoute, children }: PropsWithChildren<{ userRoute: Route }>) {
  return (
    <GalleryLink
      to={userRoute}
      eventElementId="User Profile Picture"
      eventName="User Profile Picture Click"
      // TODO: analytics prop drill
      eventContext={null}
    >
      {children}
    </GalleryLink>
  );
}

export function ProfilePicture({ userRef, clickDisabled = false, ...rest }: Props) {
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

  const { token, profileImage } = user?.profileImage ?? {};

  const firstLetter = user?.username?.substring(0, 1) ?? '';

  const renderedPfp = useMemo(() => {
    if (profileImage?.previewURLs?.medium) {
      return <RawProfilePicture imageUrl={profileImage.previewURLs.medium} {...rest} />;
    }
    if (!token) {
      return <RawProfilePicture letter={firstLetter} {...rest} />;
    }
    return (
      <NftFailureBoundary
        tokenId={token.dbid}
        fallback={<RawProfilePicture letter={firstLetter} {...rest} />}
        loadingFallback={<RawProfilePicture letter={firstLetter} {...rest} />}
      >
        <ValidProfilePicture tokenRef={token} {...rest} />
      </NftFailureBoundary>
    );
  }, [firstLetter, profileImage, rest, token]);

  if (!user) {
    return null;
  }

  if (clickDisabled) {
    return renderedPfp;
  }

  return <PfpLinkWrapper userRoute={userProfileLink}>{renderedPfp}</PfpLinkWrapper>;
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
