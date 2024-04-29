import { ViewProps } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { ProfilePictureFragment$key } from '~/generated/ProfilePictureFragment.graphql';
import { ProfilePictureValidFragment$key } from '~/generated/ProfilePictureValidFragment.graphql';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';

import { RawProfilePicture, RawProfilePictureProps } from './RawProfilePicture';

export type ProfilePictureProps = {
  style?: ViewProps['style'];
  userRef: ProfilePictureFragment$key | null;
} & Pick<RawProfilePictureProps, 'size' | 'isEditable' | 'onPress' | 'hasInset' | 'style'>;

export function ProfilePicture({ userRef, style, ...rest }: ProfilePictureProps) {
  const user = useFragment(
    graphql`
      fragment ProfilePictureFragment on GalleryUser {
        username

        profileImage {
          ... on TokenProfileImage {
            token {
              ...ProfilePictureValidFragment
              definition {
                media {
                  ... on Media {
                    previewURLs {
                      small
                    }
                  }
                }
              }
            }
          }
          ... on EnsProfileImage {
            __typename
            profileImage {
              __typename
              previewURLs {
                small
              }
            }
          }
        }
      }
    `,
    userRef
  );

  const { token, profileImage: ensImage } = user?.profileImage ?? {};
  const ensImageUrl = ensImage?.previewURLs?.small;

  const letter = user?.username?.[0]?.toUpperCase();

  const fallbackProfilePicture = (
    <RawProfilePicture
      eventElementId="ProfilePicture"
      eventName="ProfilePicture pressed"
      // TODO analytics prop drill
      eventContext={null}
      letter={letter ?? '?'}
      style={style}
      {...rest}
    />
  );

  if (ensImageUrl) {
    return (
      <ReportingErrorBoundary fallback={fallbackProfilePicture}>
        <RawProfilePicture
          eventElementId="ProfilePicture"
          eventName="ProfilePicture pressed"
          // TODO analytics prop drill
          eventContext={null}
          imageUrl={ensImageUrl}
          style={style}
          {...rest}
        />
      </ReportingErrorBoundary>
    );
  } else if (token) {
    return (
      <ReportingErrorBoundary fallback={fallbackProfilePicture}>
        <ValidProfilePicture
          eventElementId="ProfilePicture"
          eventName="ProfilePicture pressed"
          // TODO analytics prop drill
          eventContext={null}
          tokenRef={token}
          style={style}
          {...rest}
        />
      </ReportingErrorBoundary>
    );
  } else if (token) {
    return (
      <ReportingErrorBoundary fallback={fallbackProfilePicture}>
        <ValidProfilePicture
          style={style}
          tokenRef={token}
          eventElementId={null}
          eventName={null}
          eventContext={null}
          {...rest}
        />
      </ReportingErrorBoundary>
    );
  } else {
    return fallbackProfilePicture;
  }
}

type ValidProfilePictureProps = {
  style?: ViewProps['style'];
  tokenRef: ProfilePictureValidFragment$key;
} & Omit<RawProfilePictureProps, 'imageUrl'>;

function ValidProfilePicture({ tokenRef, style, ...rest }: ValidProfilePictureProps) {
  const token = useFragment(
    graphql`
      fragment ProfilePictureValidFragment on Token {
        ...useGetPreviewImagesSingleFragment
      }
    `,
    tokenRef
  );

  const imageUrl = useGetSinglePreviewImage({ tokenRef: token, size: 'small' }) ?? '';

  return <RawProfilePicture imageUrl={imageUrl} style={style} {...rest} />;
}
