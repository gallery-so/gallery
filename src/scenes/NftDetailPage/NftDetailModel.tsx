import styled from 'styled-components';
import { useEffect } from 'react';
import { graphql, useFragment } from 'react-relay';
import { NftDetailModelFragment$key } from '__generated__/NftDetailModelFragment.graphql';
import { ContentIsLoadedEvent } from 'contexts/shimmer/ShimmerContext';
import { useThrowOnMediaFailure } from 'hooks/useNftRetry';

type Props = {
  mediaRef: NftDetailModelFragment$key;
  onLoad: () => void;
};

// TODO: Clean this up once fixed
// https://github.com/google/model-viewer/issues/1502

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerJSX &
        React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

interface ModelViewerJSX {
  src: string;
  poster?: string;
  class: string;
}

function NftDetailModel({ mediaRef, onLoad }: Props) {
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
        src={contentRenderURL}
      />
    </StyledNftDetailModel>
  );
}

// stop-gap as the backend doesn't always categorize GltfMedia
export function RawNftDetailModel({ url, onLoad }: { url: string; onLoad: ContentIsLoadedEvent }) {
  useEffect(() => {
    onLoad();
  }, [onLoad]);

  return (
    <StyledNftDetailModel>
      <model-viewer class="model-viewer" auto-rotate camera-controls src={url} />
    </StyledNftDetailModel>
  );
}

const StyledNftDetailModel = styled.div`
  width: 100%;
  height: 100%;
`;

export default NftDetailModel;
