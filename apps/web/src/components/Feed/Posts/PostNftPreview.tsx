import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { StyledImageWithLoading } from '~/components/LoadingAsset/ImageWithLoading';
import NftPreview from '~/components/NftPreview/NftPreview';
import ShimmerProvider from '~/contexts/shimmer/ShimmerContext';
import { PostNftPreviewFragment$key } from '~/generated/PostNftPreviewFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import { StyledVideo } from '~/scenes/NftDetailPage/NftDetailVideo';
import { contexts } from '~/shared/analytics/constants';
import { fitDimensionsToContainerContain } from '~/shared/utils/fitDimensionsToContainer';

type Props = {
  tokenRef: PostNftPreviewFragment$key;

  onNftLoad?: () => void;
};

export const DESKTOP_TOKEN_SIZE = 517;

export default function PostNftPreview({ tokenRef, onNftLoad }: Props) {
  const token = useFragment(
    graphql`
      fragment PostNftPreviewFragment on Token {
        ...NftPreviewFragment
        media {
          ... on Media {
            dimensions {
              width
              height
            }
          }
        }
      }
    `,
    tokenRef
  );

  const resultDimensions = useMemo(() => {
    const serverSourcedDimensions = token.media?.dimensions;
    if (serverSourcedDimensions?.width && serverSourcedDimensions.height) {
      return fitDimensionsToContainerContain({
        container: { width: DESKTOP_TOKEN_SIZE, height: DESKTOP_TOKEN_SIZE },
        source: {
          width: serverSourcedDimensions.width,
          height: serverSourcedDimensions.height,
        },
      });
    }

    return {
      height: DESKTOP_TOKEN_SIZE,
      width: DESKTOP_TOKEN_SIZE,
    };
  }, [token.media?.dimensions]);

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  return (
    <StyledPostNftPreview resultHeight={resultDimensions.height}>
      <ShimmerProvider>
        <NftPreview
          tokenRef={token}
          shouldLiveRender={!isMobile}
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
