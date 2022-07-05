import breakpoints from 'components/core/breakpoints';
import { StyledImageWithLoading } from 'components/LoadingAsset/ImageWithLoading';
import NftPreview from 'components/NftPreview/NftPreview';
import { useModalActions } from 'contexts/modal/ModalContext';
import ShimmerProvider from 'contexts/shimmer/ShimmerContext';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import NftDetailView from 'scenes/NftDetailPage/NftDetailView';
import styled from 'styled-components';
import { FeedEventNftPreviewWrapperFragment$key } from '__generated__/FeedEventNftPreviewWrapperFragment.graphql';

type Props = {
  tokenRef: FeedEventNftPreviewWrapperFragment$key;
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
        collection {
          gallery @required(action: THROW) {
            owner @required(action: THROW) {
              username
            }
          }
        }
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
          <NftDetailView
            username={token?.collection?.gallery?.owner.username ?? ''}
            authenticatedUserOwnsAsset={false}
            queryRef={token}
          />
        </StyledNftDetailViewPopover>
      ),
      isFullPage: true,
    });
  }, [showModal, token]);

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

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
        hideLabelOnMobile={isMobile}
      />
    </StyledNftPreviewWrapper>
  );
}

const StyledNftPreviewWrapper = styled.div<{ maxWidth: number; maxHeight: number }>`
  ${StyledImageWithLoading} {
    max-height: calc((100vw - 64px) / 3);
    max-width: ${({ maxWidth }) => maxWidth}px;
    max-height: ${({ maxHeight }) => maxHeight}px;
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
