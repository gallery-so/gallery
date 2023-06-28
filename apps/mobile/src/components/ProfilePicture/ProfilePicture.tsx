import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { ProfilePictureFragment$key } from '~/generated/ProfilePictureFragment.graphql';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';

import { RawProfilePicture, RawProfilePictureProps } from './RawProfilePicture';

export type ProfilePictureProps = {
  userRef: ProfilePictureFragment$key | null;
} & Pick<RawProfilePictureProps, 'size' | 'isEditable' | 'onPress' | 'hasInset' | 'style'>;

export function ProfilePicture({ userRef, ...rest }: ProfilePictureProps) {
  const user = useFragment(
    graphql`
      fragment ProfilePictureFragment on GalleryUser {
        username

        profileImage {
          ... on TokenProfileImage {
            token {
              media {
                ... on Media {
                  previewURLs {
                    medium
                  }
                }
              }
            }
          }
        }
      }
    `,
    userRef
  );

  const imageUrl = user?.profileImage?.token?.media?.previewURLs?.medium;
  const letter = user?.username?.[0]?.toUpperCase();

  const fallbackProfilePicture = (
    <RawProfilePicture
      eventElementId="ProfilePicture"
      eventName="ProfilePicture pressed"
      letter={letter ?? '?'}
      {...rest}
    />
  );

  if (imageUrl) {
    return (
      <ReportingErrorBoundary fallback={fallbackProfilePicture}>
        <RawProfilePicture
          eventElementId="ProfilePicture"
          eventName="ProfilePicture pressed"
          imageUrl={imageUrl}
          {...rest}
        />
      </ReportingErrorBoundary>
    );
  } else {
    return fallbackProfilePicture;
  }
}
