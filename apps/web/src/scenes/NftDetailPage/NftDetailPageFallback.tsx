import Skeleton from 'react-loading-skeleton';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { useNftPreviewFallbackState } from '~/contexts/nftPreviewFallback/NftPreviewFallbackContext';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import {
  DESKTOP_TOKEN_DETAIL_VIEW_SIZE,
  MOBILE_TOKEN_DETAIL_VIEW_SIZE,
} from '~/shared/utils/fitDimensionsToContainer';

type Props = {
  tokenId: string;
};

export default function NftDetailPageFallback({ tokenId }: Props) {
  const { cachedUrls } = useNftPreviewFallbackState();

  const hasPreviewUrl = cachedUrls[tokenId]?.type === 'preview';
  const dimensions = cachedUrls[tokenId]?.dimensions;
  const isMobileOrMobileLarge = useIsMobileOrMobileLargeWindowWidth();

  const TOKEN_SIZE = isMobileOrMobileLarge
    ? MOBILE_TOKEN_DETAIL_VIEW_SIZE
    : DESKTOP_TOKEN_DETAIL_VIEW_SIZE;

  return (
    <StyledFullPageLoader>
      {hasPreviewUrl ? (
        <VisibilityContainer>
          <StyledImageWrapper className={'visible'}>
            <StyledImage
              src={cachedUrls[tokenId]?.url}
              height={dimensions?.height ?? TOKEN_SIZE}
              width={dimensions?.width ?? TOKEN_SIZE}
            />
          </StyledImageWrapper>
        </VisibilityContainer>
      ) : (
        <StyledNftSkeleton />
      )}

      <StyledTextContainer gap={24}>
        <StyledSkeleton />
        <StyledOwnerAndCreator>
          <VStack gap={2}>
            <StyledHeaderSkeleton />
          </VStack>
          <VStack gap={2}>
            <StyledHeaderSkeleton />
          </VStack>
        </StyledOwnerAndCreator>
        <StyledDescriptionSkeleton />
        <StyledThinSkeleton />
        <StyledButtonSkeleton />
        <StyledButtonSkeleton />
      </StyledTextContainer>
    </StyledFullPageLoader>
  );
}

const StyledFullPageLoader = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-direction: row;

  @media only screen and (max-width: 760px) {
    flex-direction: column;
    padding-left: 24px;
    padding-right: 24px;
  }
`;

const VisibilityContainer = styled.div`
  position: relative;
  @media only screen and ${breakpoints.tablet} {
    margin-left: 84px;
  }
`;

const StyledTextContainer = styled(VStack)`
  margin-left: 56px;

  @media only screen and (max-width: 760px) {
    margin-top: 56px;
    margin-left: 0px;
    padding-right: 10%;
    padding-left: 10%;
    width: 400px;
  }
`;

export const StyledNftSkeleton = styled(Skeleton)`
  width: 350px;
  height: 350px;

  @media only screen and ${breakpoints.tablet} {
    width: 600px;
    height: 600px;
    margin-left: 80px;
  }
`;

const StyledSkeleton = styled(Skeleton)`
  width: 100%;
  height: 57px;

  @media only screen and ${breakpoints.tablet} {
    width: 440px;
  }
`;

const StyledThinSkeleton = styled(Skeleton)`
  width: 100%;
  height: 40px;

  @media only screen and ${breakpoints.tablet} {
    width: 440px;
  }
`;

const StyledButtonSkeleton = styled(Skeleton)`
  width: 100%;
  height: 45px;

  @media only screen and ${breakpoints.tablet} {
    width: 180px;
  }
`;

const StyledDescriptionSkeleton = styled(Skeleton)`
  width: 100%;
  height: 140px;

  @media only screen and ${breakpoints.tablet} {
    width: 420px;
  }
`;

const StyledHeaderSkeleton = styled(Skeleton)`
  height: 50px;
  width: 65%;
`;

const StyledOwnerAndCreator = styled(HStack)`
  > ${VStack} {
    width: 50%;
  }
`;

const StyledImage = styled.img<{ height: number; width: number }>`
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;
  border: none;
`;

const StyledImageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 600px;
  height: 100%;
  opacity: 0;
  pointer-events: none;
  transition: opacity 1s ease-in-out;
  &.visible {
    opacity: 1;
    pointer-events: auto;
  }
`;
