import styled from 'styled-components';
import ImageWithLoading from 'components/LoadingAsset/ImageWithLoading';
import { graphql, useFragment } from 'react-relay';
import { NftDetailAudioFragment$key } from '__generated__/NftDetailAudioFragment.graphql';

type Props = {
  nftRef: NftDetailAudioFragment$key;
};

function NftDetailAudio({ nftRef }: Props) {
  const nft = useFragment(
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
    nftRef
  );

  if (nft.media.__typename !== 'AudioMedia') {
    throw new Error('Using an NftDetailAudio component without an audio media type');
  }

  return (
    <StyledAudioContainer>
      <ImageWithLoading src={nft.media?.previewURLs.large} alt={nft.name ?? ''} />
      <StyledAudio
        controls
        loop
        controlsList="nodownload"
        preload="none"
        src={nft.media.contentRenderURL}
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
