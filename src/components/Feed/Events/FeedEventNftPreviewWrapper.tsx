import breakpoints from 'components/core/breakpoints';
import { StyledImageWithLoading } from 'components/LoadingAsset/ImageWithLoading';
import NftPreview from 'components/NftPreview/NftPreview';
import ShimmerProvider from 'contexts/shimmer/ShimmerContext';
import { graphql, useFragment } from 'react-relay';
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
      }
    `,
    tokenRef
  );

  return (
    <StyledNftPreviewWrapper maxWidth={maxWidth} maxHeight={maxHeight}>
      <NftPreview tokenRef={token} nftPreviewWidth={'100%'} previewSize={maxWidth} />
    </StyledNftPreviewWrapper>
  );
}

const StyledNftPreviewWrapper = styled.div<{ maxWidth: number; maxHeight: number }>`
  ${StyledImageWithLoading} {
    max-height: calc((100vw - 64px) / 3);
    @media only screen and ${breakpoints.desktop} {
      max-width: ${({ maxWidth }) => maxWidth}px;
      max-height: ${({ maxHeight }) => maxHeight}px;
    }
  }
`;

export default NftPreviewWithShimmer;
