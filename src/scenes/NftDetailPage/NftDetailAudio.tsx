import styled from 'styled-components';
import ImageWithLoading from 'components/LoadingAsset/ImageWithLoading';
import { graphql, useFragment } from 'react-relay';
import { NftDetailAudioFragment$key } from '__generated__/NftDetailAudioFragment.graphql';

type Props = {
  tokenRef: NftDetailAudioFragment$key;
};

function NftDetailAudio({ tokenRef }: Props) {
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

  if (token.media.__typename !== 'AudioMedia') {
    throw new Error('Using an NftDetailAudio component without an audio media type');
  }

  return (
    <StyledAudioContainer>
      <ImageWithLoading src={token.media?.previewURLs.large} alt={token.name ?? ''} />
      <StyledAudio
        controls
        loop
        controlsList="nodownload"
        preload="none"
        src={token.media.contentRenderURL}
      />
    </StyledAudioContainer>
  );
}

const StyledAudioContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledAudio = styled.audio`
  width: 100%;
  height: 32px;
`;

export default NftDetailAudio;
