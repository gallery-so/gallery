import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { StyledImageWithLoading } from '~/components/LoadingAsset/ImageWithLoading';
import NftPreview from '~/components/NftPreview/NftPreview';
import ShimmerProvider from '~/contexts/shimmer/ShimmerContext';
import { PostNftPreviewFragment$key } from '~/generated/PostNftPreviewFragment.graphql';
import { StyledVideo } from '~/scenes/NftDetailPage/NftDetailVideo';

type Props = {
  tokenRef: PostNftPreviewFragment$key;

  onNftLoad?: () => void;
};

const DESKTOP_TOKEN_SIZE = 517;

export default function PostNftPreview({ tokenRef, onNftLoad }: Props) {
  const token = useFragment(
    graphql`
      fragment PostNftPreviewFragment on Token {
        ...NftPreviewFragment
      }
    `,
    tokenRef
  );

  return (
    <StyledPostNftPreview>
      <ShimmerProvider>
        <NftPreview tokenRef={token} shouldLiveRender onLoad={onNftLoad} />
      </ShimmerProvider>
    </StyledPostNftPreview>
  );
}

const StyledPostNftPreview = styled.div`
  display: flex;
  width: 100%;
  height: 100%;

  @media only screen and ${breakpoints.desktop} {
    width: ${DESKTOP_TOKEN_SIZE}px;
    height: ${DESKTOP_TOKEN_SIZE}px;
  }

  ${StyledImageWithLoading}, ${StyledVideo} {
    @media only screen and ${breakpoints.desktop} {
      max-width: ${DESKTOP_TOKEN_SIZE}px;
      max-height: ${DESKTOP_TOKEN_SIZE}px;
    }
  }
`;
