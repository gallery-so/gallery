import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { StyledImageWithLoading } from '~/components/LoadingAsset/ImageWithLoading';
import { StyledVideo } from '~/components/LoadingAsset/VideoWithLoading';
import CollectionTokenPreview from '~/components/NftPreview/CollectionTokenPreview';
import ShimmerProvider from '~/contexts/shimmer/ShimmerContext';
import { FeedEventNftPreviewWrapperFragment$key } from '~/generated/FeedEventNftPreviewWrapperFragment.graphql';

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
        ...CollectionTokenPreviewFragment
      }
    `,
    tokenRef
  );

  return (
    <StyledNftPreviewWrapper
      maxWidth={maxWidth}
      maxHeight={maxHeight}
      onClick={(e) => e.stopPropagation()}
    >
      <CollectionTokenPreview tokenRef={token} disableLiverender isInFeedEvent />
    </StyledNftPreviewWrapper>
  );
}

const StyledNftPreviewWrapper = styled.div<{ maxWidth: number; maxHeight: number }>`
  display: flex;
  width: 100%;
  max-height: ${({ maxHeight }) => maxHeight}px;
  min-width: ${({ maxWidth }) => maxWidth ?? 150}px;

  ${StyledImageWithLoading}, ${StyledVideo} {
    max-width: ${({ maxWidth }) => maxWidth}px;
    max-height: ${({ maxHeight }) => maxHeight}px;
  }
`;

export default NftPreviewWithShimmer;
