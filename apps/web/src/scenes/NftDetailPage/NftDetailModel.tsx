import { useEffect } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { ContentIsLoadedEvent } from '~/contexts/shimmer/ShimmerContext';
import { NftDetailModelFragment$key } from '~/generated/NftDetailModelFragment.graphql';
import { useThrowOnMediaFailure } from '~/hooks/useNftRetry';

// TODO: Clean this up once fixed
// https://github.com/google/model-viewer/issues/1502

interface ModelViewerJSX {
  src: string;
  poster?: string;
  class: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerJSX &
        React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

type Props = {
  mediaRef: NftDetailModelFragment$key;
  onLoad: () => void;
  // Prop that helps model fit to its parent container
  fullHeight: boolean;
};

function NftDetailModel({ mediaRef, onLoad, fullHeight }: Props) {
  const { contentRenderURL } = useFragment(
    graphql`
      fragment NftDetailModelFragment on GltfMedia {
        contentRenderURL @required(action: THROW)
      }
    `,
    mediaRef
  );

  // We consider models to be loaded when the component mounts
  useEffect(onLoad, [onLoad]);

  const { handleError } = useThrowOnMediaFailure('NftDetailModal');

  return (
    <StyledNftDetailModel>
      <model-viewer
        onError={handleError}
        class="model-viewer"
        auto-rotate
        camera-controls
        interaction-prompt={false}
        src={contentRenderURL}
        style={{
          width: '100%',
          height: fullHeight ? '100%' : undefined,
          aspectRatio: fullHeight ? 1 : undefined,
        }}
      />
    </StyledNftDetailModel>
  );
}

// stop-gap as the backend doesn't always categorize GltfMedia
export function RawNftDetailModel({
  url,
  onLoad,
  fullHeight,
}: {
  url: string;
  onLoad: ContentIsLoadedEvent;
  fullHeight: boolean;
}) {
  useEffect(() => {
    onLoad();
  }, [onLoad]);

  return (
    <StyledNftDetailModel>
      <model-viewer
        class="model-viewer"
        auto-rotate
        camera-controls
        interaction-prompt={false}
        src={url}
        style={{
          width: '100%',
          height: fullHeight ? '100%' : undefined,
        }}
      />
    </StyledNftDetailModel>
  );
}

const StyledNftDetailModel = styled.div`
  width: 100%;
  height: 100%;
`;

export default NftDetailModel;
