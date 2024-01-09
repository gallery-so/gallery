import { ViewProps } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { CommunityProfilePictureFragment$key } from '~/generated/CommunityProfilePictureFragment.graphql';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import { extractRelevantMetadataFromCommunity } from '~/shared/utils/extractRelevantMetadataFromCommunity';

import { RawProfilePicture, RawProfilePictureProps } from './RawProfilePicture';

export type ProfilePictureProps = {
  style?: ViewProps['style'];
  communityRef: CommunityProfilePictureFragment$key;
} & Pick<RawProfilePictureProps, 'size' | 'isEditable' | 'onPress' | 'hasInset' | 'style'>;

export function CommunityProfilePicture({ communityRef, style, ...rest }: ProfilePictureProps) {
  const community = useFragment(
    graphql`
      fragment CommunityProfilePictureFragment on Community {
        name
        profileImageURL
        ...extractRelevantMetadataFromCommunityFragment
      }
    `,
    communityRef
  );

  const imageUrl = community?.profileImageURL;

  const { contractAddress } = extractRelevantMetadataFromCommunity(community);

  const letter = community?.name?.[0]?.toUpperCase() || contractAddress[0]?.toUpperCase();

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
