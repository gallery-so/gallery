import { useSetContentIsLoaded } from 'contexts/shimmer/ShimmerContext';
import { useMemo } from 'react';
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
      fragment NftDetailAnimationFragment on Nft {
        media @required(action: THROW) {
          ... on HtmlMedia {
            __typename
            contentRenderURL @required(action: THROW)
          }
          ... on UnknownMedia {
            __typename
            contentRenderURL @required(action: THROW)
          }
        }
      }
    `,
    mediaRef
  );

  const setContentIsLoaded = useSetContentIsLoaded();

  const contentRenderURL = useMemo(() => {
    if (nft.media.__typename === 'HtmlMedia' || nft.media.__typename === 'UnknownMedia') {
      return nft.media.contentRenderURL;
    }

    return '';
  }, [nft.media]);

  return (
    <StyledNftDetailAnimation>
      <StyledIframe src={contentRenderURL} onLoad={setContentIsLoaded} />
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
