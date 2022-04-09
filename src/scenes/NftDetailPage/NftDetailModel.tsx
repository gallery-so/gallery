import { useSetContentIsLoaded } from 'contexts/shimmer/ShimmerContext';
import styled from 'styled-components';
import { useEffect } from 'react';
import { graphql, useFragment } from 'react-relay';
import { NftDetailModelFragment$key } from '__generated__/NftDetailModelFragment.graphql';

type Props = {
  mediaRef: NftDetailModelFragment$key;
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

function NftDetailModel({ mediaRef }: Props) {
  const { contentRenderURL } = useFragment(
    graphql`
      fragment NftDetailModelFragment on GltfMedia {
        contentRenderURL @required(action: THROW)
      }
    `,
    mediaRef
  );

  const setContentIsLoaded = useSetContentIsLoaded();
  useEffect(setContentIsLoaded, [setContentIsLoaded]);

  return (
    <StyledNftDetailModel>
      <model-viewer class="model-viewer" auto-rotate camera-controls src={contentRenderURL} />
    </StyledNftDetailModel>
  );
}

const StyledNftDetailModel = styled.div`
  width: 100%;
  height: 100%;
`;

export default NftDetailModel;
