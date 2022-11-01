import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';
import { NftDetailAnimationFragment$key } from '__generated__/NftDetailAnimationFragment.graphql';
import { RawNftDetailModel } from './NftDetailModel';
import processIFrameRenderUrl from './processIFrameRenderUrl';
import { ContentIsLoadedEvent } from 'contexts/shimmer/ShimmerContext';

type Props = {
  mediaRef: NftDetailAnimationFragment$key;
  onLoad: ContentIsLoadedEvent;
};

function NftDetailAnimation({ mediaRef, onLoad }: Props) {
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

  const contentRenderURL = useMemo(() => {
    if (token.media.__typename === 'HtmlMedia' || token.media.__typename === 'UnknownMedia') {
      return token.media.contentRenderURL;
    }

    return '';
  }, [token.media]);

  if (contentRenderURL.endsWith('.glb')) {
    return <RawNftDetailModel onLoad={onLoad} url={contentRenderURL} />;
  }

  return (
    <StyledNftDetailAnimation>
      <StyledIframe
        src={processIFrameRenderUrl(contentRenderURL)}
        onLoad={onLoad}
        // Lets the resource run scripts (but not create popup windows): https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe
        // More specifically, this prevents the rendered iframe from displaying Alerts
        sandbox="allow-scripts allow-same-origin"
      />
    </StyledNftDetailAnimation>
  );
}

const StyledNftDetailAnimation = styled.div`
  width: inherit;
  height: inherit;
`;

const StyledIframe = styled.iframe`
  width: inherit;
  height: inherit;
  border: none;

  aspect-ratio: 1;
`;

export default NftDetailAnimation;
