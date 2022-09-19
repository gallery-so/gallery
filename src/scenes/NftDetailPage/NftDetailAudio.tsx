import styled from 'styled-components';
import ImageWithLoading from 'components/LoadingAsset/ImageWithLoading';
import { graphql, useFragment } from 'react-relay';
import { NftDetailAudioFragment$key } from '__generated__/NftDetailAudioFragment.graphql';
import { useIsDesktopWindowWidth } from 'hooks/useWindowSize';
import noop from 'utils/noop';
import { CouldNotRenderNftError } from 'errors/CouldNotRenderNftError';
import { useThrowOnMediaFailure } from 'hooks/useNftRetry';
import { Spacer, VStack } from 'components/core/Spacer/Stack';

type Props = {
  tokenRef: NftDetailAudioFragment$key;
  onLoad: () => void;
};

function NftDetailAudio({ tokenRef, onLoad }: Props) {
  const token = useFragment(
    graphql`
      fragment NftDetailAudioFragment on Token {
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
    `,
    tokenRef
  );

  const isDesktop = useIsDesktopWindowWidth();
  const { handleError } = useThrowOnMediaFailure('NftDetailAudio');

  if (token.media.__typename !== 'AudioMedia') {
    throw new CouldNotRenderNftError(
      'NftDetailAudio',
      'Using an NftDetailAudio component without an audio media type'
    );
  }

  return (
    <StyledAudioContainer gap={isDesktop ? 40 : 0}>
      {/* TODO(Terence): How do we want to handle onLoad / onError since this loads two things? */}
      <VStack>
        <ImageWithLoading
          onLoad={noop}
          src={token.media?.previewURLs.large}
          alt={token.name ?? ''}
        />
        <StyledAudio
          controls
          loop
          controlsList="nodownload"
          preload="none"
          onLoad={onLoad}
          onError={handleError}
          src={token.media.contentRenderURL}
        />
      </VStack>
      <Spacer />
    </StyledAudioContainer>
  );
}

const StyledAudioContainer = styled(VStack)`
  width: 100%;
`;

const StyledAudio = styled.audio`
  width: 100%;
  height: 32px;
`;

export default NftDetailAudio;
