import { ViewProps } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { ProfilePictureFragment$key } from '~/generated/ProfilePictureFragment.graphql';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';

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
  const imageUrl = token?.definition?.media?.previewURLs?.small ?? ensImage?.previewURLs?.small;

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

  if (imageUrl) {
    return (
      <ReportingErrorBoundary fallback={fallbackProfilePicture}>
        <RawProfilePicture
          eventElementId="ProfilePicture"
          eventName="ProfilePicture pressed"
          // TODO analytics prop drill
          eventContext={null}
          imageUrl={imageUrl}
          style={style}
          {...rest}
        />
      </ReportingErrorBoundary>
    );
  } else {
    return fallbackProfilePicture;
  }
}
