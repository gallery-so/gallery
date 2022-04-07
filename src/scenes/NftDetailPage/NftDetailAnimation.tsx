import { useSetContentIsLoaded } from 'contexts/shimmer/ShimmerContext';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';
import { NftDetailAnimationFragment$key } from '__generated__/NftDetailAnimationFragment.graphql';

type Props = {
  mediaRef: NftDetailAnimationFragment$key;
};

function NftDetailAnimation({ mediaRef }: Props) {
  const nft = useFragment(
    graphql`
      fragment NftDetailAnimationFragment on HtmlMedia {
        contentRenderURL @required(action: THROW)
      }
    `,
    mediaRef
  );

  const setContentIsLoaded = useSetContentIsLoaded();

  return (
    <StyledNftDetailAnimation>
      <StyledIframe src={nft.contentRenderURL} onLoad={setContentIsLoaded} />
    </StyledNftDetailAnimation>
  );
}

const StyledNftDetailAnimation = styled.div`
  width: 100%;
`;
const StyledIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  min-height: min(500px, 70vh);
`;

export default NftDetailAnimation;
