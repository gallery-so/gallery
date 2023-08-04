import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { StyledImageWithLoading } from '~/components/LoadingAsset/ImageWithLoading';
import NftPreview from '~/components/NftPreview/NftPreview';
import ShimmerProvider from '~/contexts/shimmer/ShimmerContext';
import { PostNftPreviewFragment$key } from '~/generated/PostNftPreviewFragment.graphql';
import { StyledVideo } from '~/scenes/NftDetailPage/NftDetailVideo';

type Props = {
  tokenRef: PostNftPreviewFragment$key;
  tokenSize: number;
};

export default function PostNftPreview({ tokenRef, tokenSize }: Props) {
  const token = useFragment(
    graphql`
      fragment PostNftPreviewFragment on Token {
        ...NftPreviewFragment
      }
    `,
    tokenRef
  );

  return (
    <StyledPostNftPreview width={tokenSize} height={tokenSize}>
      <ShimmerProvider>
        <NftPreview tokenRef={token} previewSize={tokenSize} shouldLiveRender />
      </ShimmerProvider>
    </StyledPostNftPreview>
  );
}

const StyledPostNftPreview = styled.div<{ width: number; height: number }>`
  display: flex;
  max-width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;

  ${StyledImageWithLoading}, ${StyledVideo} {
    max-width: ${({ width }) => width}px;
    max-height: ${({ height }) => height}px;
  }
`;
