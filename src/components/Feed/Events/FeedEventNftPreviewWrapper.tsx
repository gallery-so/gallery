import breakpoints from 'components/core/breakpoints';
import { StyledImageWithLoading } from 'components/LoadingAsset/ImageWithLoading';
import NftPreview from 'components/NftPreview/NftPreview';
import { useModalActions } from 'contexts/modal/ModalContext';
import ShimmerProvider from 'contexts/shimmer/ShimmerContext';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import NftDetailView from 'scenes/NftDetailPage/NftDetailView';
import styled from 'styled-components';

type Props = {
  tokenRef: any;
  maxWidth: number;
  maxHeight: number;
};

// simple wrapper component so the child can pull state from ShimmerProvider
function NftPreviewWithShimmer(props: Props) {
  return (
    <ShimmerProvider>
      <FeedEventNftPreviewWrapper {...props} />
    </ShimmerProvider>
  );
}
function FeedEventNftPreviewWrapper({ tokenRef, maxWidth, maxHeight }: Props) {
  const token = useFragment(
    graphql`
      fragment FeedEventNftPreviewWrapperFragment on CollectionToken {
        # dbid
        ...NftPreviewFragment
        ...NftDetailViewFragment
      }
    `,
    tokenRef
  );

  const { showModal } = useModalActions();

  const handleClick = useCallback(() => {
    showModal({
      content: (
        <StyledNftDetailViewPopover>
          <NftDetailView username={'kaito'} authenticatedUserOwnsAsset={false} queryRef={token} />
        </StyledNftDetailViewPopover>
      ),
      isFullPageOverride: true,
    });
  }, [showModal, token]);

  return (
    <StyledNftPreviewWrapper
      maxWidth={maxWidth}
      maxHeight={maxHeight}
      onClick={(e) => e.stopPropagation()}
    >
      <NftPreview
        tokenRef={token}
        nftPreviewWidth={'100%'}
        previewSize={maxWidth}
        onClick={handleClick}
      />
    </StyledNftPreviewWrapper>
  );
}

const StyledNftPreviewWrapper = styled.div<{ maxWidth: number; maxHeight: number }>`
  ${StyledImageWithLoading} {
    max-height: calc((100vw - 64px) / 3);
    // @media only screen and ${breakpoints.desktop} {
    max-width: ${({ maxWidth }) => maxWidth}px;
    max-height: ${({ maxHeight }) => maxHeight}px;
    // }
  }
`;

const StyledNftDetailViewPopover = styled.div`
  display: flex;
  justify-content: center;
  height: 100%;
  padding: 80px 0;

  @media only screen and ${breakpoints.desktop} {
    padding: 0;
  }
`;

export default NftPreviewWithShimmer;
