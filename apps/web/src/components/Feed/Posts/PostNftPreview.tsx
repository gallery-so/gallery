import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { StyledImageWithLoading } from '~/components/LoadingAsset/ImageWithLoading';
import NftPreview from '~/components/NftPreview/NftPreview';
import ShimmerProvider from '~/contexts/shimmer/ShimmerContext';
import { PostNftPreviewFragment$key } from '~/generated/PostNftPreviewFragment.graphql';
import { PostNftPreviewQueryFragment$key } from '~/generated/PostNftPreviewQueryFragment.graphql';
import { useContainedDimensionsForToken } from '~/hooks/useContainedDimensionsForToken';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import { StyledVideo } from '~/scenes/NftDetailPage/NftDetailVideo';
import { contexts } from '~/shared/analytics/constants';

type Props = {
  queryRef: PostNftPreviewQueryFragment$key;
  tokenRef: PostNftPreviewFragment$key;
  onNftLoad?: () => void;
};

export const DESKTOP_TOKEN_SIZE = 517;

export default function PostNftPreview({ queryRef, tokenRef, onNftLoad }: Props) {
  const query = useFragment(
    graphql`
      fragment PostNftPreviewQueryFragment on Query {
        ...NftPreviewQueryFragment
      }
    `,
    queryRef
  );
  const token = useFragment(
    graphql`
      fragment PostNftPreviewFragment on Token {
        ...NftPreviewFragment
        definition {
          media @required(action: THROW) {
            ... on Media {
              ...useContainedDimensionsForTokenFragment
            }
            __typename
          }
        }
      }
    `,
    tokenRef
  );

  const resultDimensions = useContainedDimensionsForToken({
    mediaRef: token.definition.media,
    tokenSize: DESKTOP_TOKEN_SIZE,
  });
  const isMobile = useIsMobileOrMobileLargeWindowWidth();
  const shouldLiveRender = !isMobile || token.definition.media.__typename === 'VideoMedia';

  return (
    <StyledPostNftPreview resultHeight={resultDimensions.height}>
      <ShimmerProvider>
        <NftPreview
          queryRef={query}
          tokenRef={token}
          shouldLiveRender={shouldLiveRender}
          onLoad={onNftLoad}
          eventContext={contexts.Posts}
        />
      </ShimmerProvider>
    </StyledPostNftPreview>
  );
}

const StyledPostNftPreview = styled.div<{ resultHeight: number }>`
  display: flex;
  width: 100%;
  height: 100%;

  @media only screen and ${breakpoints.desktop} {
    height: ${({ resultHeight }) => resultHeight}px;
    width: ${DESKTOP_TOKEN_SIZE}px;
  }

  ${StyledImageWithLoading}, ${StyledVideo} {
    @media only screen and ${breakpoints.desktop} {
      max-width: ${DESKTOP_TOKEN_SIZE}px;
      max-height: ${DESKTOP_TOKEN_SIZE}px;
    }
  }
`;
