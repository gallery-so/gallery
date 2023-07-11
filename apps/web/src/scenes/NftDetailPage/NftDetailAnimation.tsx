import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { ContentIsLoadedEvent } from '~/contexts/shimmer/ShimmerContext';
import { NftDetailAnimationFragment$key } from '~/generated/NftDetailAnimationFragment.graphql';

import { RawNftDetailModel } from './NftDetailModel';
import processIFrameRenderUrl from './processIFrameRenderUrl';

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
          ... on TextMedia {
            __typename
            mediaURL
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
    } else if (token.media.__typename === 'TextMedia') {
      if (token.media.mediaURL?.startsWith('data:')) {
        const mimeType = token.media.mediaURL.split('data:')[1]?.split(';')[0];

        if (mimeType === 'text/html') {
          return token.media.mediaURL;
        }
      }
    }

    return '';
  }, [token.media]);

  if (contentRenderURL.endsWith('.glb')) {
    return <RawNftDetailModel onLoad={onLoad} url={contentRenderURL} fullHeight />;
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
