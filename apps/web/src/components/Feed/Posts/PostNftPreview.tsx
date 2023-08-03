import { useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { StyledImageWithLoading } from '~/components/LoadingAsset/ImageWithLoading';
import NftPreview from '~/components/NftPreview/NftPreview';
import ShimmerProvider from '~/contexts/shimmer/ShimmerContext';
import { PostNftPreviewFragment$key } from '~/generated/PostNftPreviewFragment.graphql';
import useTokenDetailModal from '~/hooks/useTokenDetailModal';
import { StyledVideo } from '~/scenes/NftDetailPage/NftDetailVideo';

type Props = {
  tokenRef: PostNftPreviewFragment$key;
  tokenSize: number;
};

export default function PostNftPreview({ tokenRef, tokenSize }: Props) {
  const token = useFragment(
    graphql`
      fragment PostNftPreviewFragment on Token {
        dbid
        owner {
          username
        }
        ...NftPreviewFragment
      }
    `,
    tokenRef
  );

  const showTokenDetailModal = useTokenDetailModal();

  const handleClick = useCallback(() => {
    const ownerUsername = token.owner?.username ?? '';

    showTokenDetailModal(ownerUsername, token.dbid);
  }, [showTokenDetailModal, token.dbid, token.owner?.username]);

  return (
    <StyledPostNftPreview width={517} height={517}>
      <ShimmerProvider>
        <NftPreview
          tokenRef={token}
          previewSize={tokenSize}
          onClick={handleClick}
          shouldLiveRender
        />
      </ShimmerProvider>
    </StyledPostNftPreview>
  );
}

const StyledPostNftPreview = styled.div<{ width: number; height: number }>`
  display: flex;

  width: ${({ width }) => width}px;
  // height: ${({ height }) => height}px;

  ${StyledImageWithLoading}, ${StyledVideo} {
    max-width: ${({ width }) => width}px;
    max-height: ${({ height }) => height}px;
  }
`;
