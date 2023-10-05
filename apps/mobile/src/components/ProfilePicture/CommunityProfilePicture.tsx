import { ViewProps } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { CommunityProfilePictureFragment$key } from '~/generated/CommunityProfilePictureFragment.graphql';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';

import { RawProfilePicture, RawProfilePictureProps } from './RawProfilePicture';

export type ProfilePictureProps = {
  style?: ViewProps['style'];
  communityRef: CommunityProfilePictureFragment$key | null;
} & Pick<RawProfilePictureProps, 'size' | 'isEditable' | 'onPress' | 'hasInset' | 'style'>;

export function CommunityProfilePicture({ communityRef, style, ...rest }: ProfilePictureProps) {
  const community = useFragment(
    graphql`
      fragment CommunityProfilePictureFragment on Community {
        name
        contractAddress {
          address
        }
        profileImageURL
      }
    `,
    communityRef
  );

  const imageUrl = community?.profileImageURL;

  const letter =
    community?.name?.[0]?.toUpperCase() || community?.contractAddress?.address?.[0]?.toUpperCase();

  const fallbackProfilePicture = (
    <RawProfilePicture
      eventElementId="ProfilePicture"
      eventName="ProfilePicture pressed"
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
