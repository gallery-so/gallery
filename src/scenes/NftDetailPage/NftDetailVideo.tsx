import { useSetContentIsLoaded } from 'contexts/shimmer/ShimmerContext';
import { useFragment } from 'react-relay';
import styled from 'styled-components';
import { graphql } from 'relay-runtime';
import { NftDetailVideoFragment$key } from '__generated__/NftDetailVideoFragment.graphql';

type Props = {
  mediaRef: NftDetailVideoFragment$key;
  maxHeight: number;
};

function NftDetailVideo({ mediaRef, maxHeight }: Props) {
  const nft = useFragment(
    graphql`
      fragment NftDetailVideoFragment on VideoMedia {
        contentRenderURLs @required(action: THROW) {
          raw @required(action: THROW)
        }
      }
    `,
    mediaRef
  );
  const setContentIsLoaded = useSetContentIsLoaded();

  return (
    <StyledVideo
      src={nft.contentRenderURLs.raw}
      muted
      autoPlay
      loop
      playsInline
      controls
      onLoadStart={setContentIsLoaded}
      maxHeight={maxHeight}
    />
  );
}

const StyledVideo = styled.video<{ maxHeight: number }>`
  width: 100%;
  height: 100%;
  border: none;

  max-height: ${({ maxHeight }) => maxHeight}px;
`;

export default NftDetailVideo;
