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
  const token = useFragment(
    graphql`
      fragment NftDetailVideoFragment on VideoMedia {
        contentRenderURLs @required(action: THROW) {
          raw @required(action: THROW)
          large @required(action: THROW)
        }
      }
    `,
    mediaRef
  );
  const setContentIsLoaded = useSetContentIsLoaded();

  return (
    <StyledVideo
      src={token.contentRenderURLs.large}
      muted
      autoPlay
      loop
      playsInline
      controls
      onLoadedData={setContentIsLoaded}
      maxHeight={maxHeight}
    />
  );
}

export const StyledVideo = styled.video<{ maxHeight: number }>`
  width: 100%;
  height: 100%;
  border: none;

  max-height: ${({ maxHeight }) => maxHeight}px;
`;

export default NftDetailVideo;
