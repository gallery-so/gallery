import { Suspense, useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import FullPageLoader from '~/components/core/Loader/FullPageLoader';
import { StyledImageWithLoading } from '~/components/LoadingAsset/ImageWithLoading';
import { StyledVideo } from '~/components/LoadingAsset/VideoWithLoading';
import NftPreview from '~/components/NftPreview/NftPreview';
import { useModalActions } from '~/contexts/modal/ModalContext';
import ShimmerProvider from '~/contexts/shimmer/ShimmerContext';
import { FeedEventNftPreviewWrapperFragment$key } from '~/generated/FeedEventNftPreviewWrapperFragment.graphql';
import { FeedEventNftPreviewWrapperQueryFragment$key } from '~/generated/FeedEventNftPreviewWrapperQueryFragment.graphql';
import { LoadableNftDetailView } from '~/scenes/NftDetailPage/NftDetailView';

type Props = {
  tokenRef: FeedEventNftPreviewWrapperFragment$key;
  queryRef: FeedEventNftPreviewWrapperQueryFragment$key;
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
function FeedEventNftPreviewWrapper({ tokenRef, queryRef, maxWidth, maxHeight }: Props) {
  const token = useFragment(
    graphql`
      fragment FeedEventNftPreviewWrapperFragment on CollectionToken {
        collection {
          dbid
        }
        token {
          dbid
        }

        ...NftPreviewFragment
      }
    `,
    tokenRef
  );

  const query = useFragment(
    graphql`
      fragment FeedEventNftPreviewWrapperQueryFragment on Query {
        ...NftDetailViewQueryFragment
      }
    `,
    queryRef
  );

  const { showModal } = useModalActions();

  const handleClick = useCallback(() => {
    if (!token.token || !token.collection) {
      return;
    }

    showModal({
      content: (
        <StyledNftDetailViewPopover>
          <Suspense fallback={<FullPageLoader />}>
            <LoadableNftDetailView
              tokenId={token.token.dbid}
              collectionId={token.collection.dbid}
              authenticatedUserOwnsAsset={false}
              queryRef={query}
            />
          </Suspense>
        </StyledNftDetailViewPopover>
      ),
      isFullPage: true,
    });
  }, [query, showModal, token]);

  return (
    <StyledNftPreviewWrapper
      maxWidth={maxWidth}
      maxHeight={maxHeight}
      onClick={(e) => e.stopPropagation()}
    >
      <NftPreview
        tokenRef={token}
        previewSize={maxWidth}
        onClick={handleClick}
        disableLiverender
        isInFeedEvent
      />
    </StyledNftPreviewWrapper>
  );
}

const StyledNftPreviewWrapper = styled.div<{ maxWidth: number; maxHeight: number }>`
  display: flex;
  width: 100%;
  max-height: ${({ maxHeight }) => maxHeight}px;
  min-width: ${({ maxWidth }) => maxWidth ?? 150}px;

  ${StyledImageWithLoading}, ${StyledVideo} {
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
