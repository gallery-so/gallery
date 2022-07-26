import { useSetContentIsLoaded } from 'contexts/shimmer/ShimmerContext';
import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';
import { NftDetailAnimationFragment$key } from '__generated__/NftDetailAnimationFragment.graphql';
import { RawNftDetailModel } from './NftDetailModel';
import processIFrameRenderUrl from './processIFrameRenderUrl';

type Props = {
  mediaRef: NftDetailAnimationFragment$key;
};

function NftDetailAnimation({ mediaRef }: Props) {
  const token = useFragment(
    graphql`
      fragment NftDetailAnimationFragment on Token {
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
    if (token.media.__typename === 'HtmlMedia' || token.media.__typename === 'UnknownMedia') {
      return token.media.contentRenderURL;
    }

    return '';
  }, [token.media]);

  if (contentRenderURL.endsWith('.glb')) {
    return <RawNftDetailModel url={contentRenderURL} />;
  }

  return (
    <StyledNftDetailAnimation>
      <StyledIframe src={processIFrameRenderUrl(contentRenderURL)} onLoad={setContentIsLoaded} />
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
  aspect-ratio: 1;
`;

export default NftDetailAnimation;
