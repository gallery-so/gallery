import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { VStack } from '~/components/core/Spacer/Stack';
import ImageWithLoading from '~/components/LoadingAsset/ImageWithLoading';
import { NftDetailAudioFragment$key } from '~/generated/NftDetailAudioFragment.graphql';
import { useThrowOnMediaFailure } from '~/hooks/useNftRetry';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';

type Props = {
  tokenRef: NftDetailAudioFragment$key;
  onLoad: () => void;
};

function NftDetailAudio({ tokenRef, onLoad }: Props) {
  const token = useFragment(
    graphql`
      fragment NftDetailAudioFragment on Token {
        definition {
          name
          media @required(action: THROW) {
            ... on AudioMedia {
              __typename
              previewURLs @required(action: THROW) {
                large @required(action: THROW)
              }
              contentRenderURL @required(action: THROW)
            }
          }
        }
      }
    `,
    tokenRef
  );

  const { handleError } = useThrowOnMediaFailure('NftDetailAudio');

  if (token.definition.media.__typename !== 'AudioMedia') {
    throw new CouldNotRenderNftError(
      'NftDetailAudio',
      'Using an NftDetailAudio component without an audio media type'
    );
  }

  return (
    <StyledAudioContainer>
      {/* TODO(Terence): How do we want to handle onLoad / onError since this loads two things? */}
      <ImageWithLoading
        onLoad={onLoad}
        src={token.definition.media?.previewURLs.large}
        alt={token.definition.name ?? ''}
      />
      <StyledAudio
        controls
        loop
        controlsList="nodownload"
        preload="none"
        onError={handleError}
        src={token.definition.media.contentRenderURL}
      />
    </StyledAudioContainer>
  );
}

const StyledAudioContainer = styled(VStack)`
  width: 100%;
  padding-bottom: 0;

  @media only screen and ${breakpoints.tablet} {
    padding-bottom: 40px;
  }
`;

const StyledAudio = styled.audio`
  width: 100%;
  height: 32px;
`;

export default NftDetailAudio;
