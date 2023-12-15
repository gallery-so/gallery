import { useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { fitDimensionsToContainerContain } from '~/shared/utils/fitDimensionsToContainer';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { useNftPreviewFallbackState } from '~/contexts/nftPreviewFallback/NftPreviewFallbackContext';

type Dimensions = {
  width?: number;
  height?: number;
};

type Props = {
  tokenId: string;
};

export default function NftDetailPageFallback({ tokenId }: Props) {
  const { cachedUrls } = useNftPreviewFallbackState();

  const hasPreviewUrl = cachedUrls[tokenId]?.type === 'preview';
  const dimensions = cachedUrls[tokenId]?.dimensions;
  console.log('dimensions', dimensions);

  return (
    <StyledFullPageLoader>
      {hasPreviewUrl ? (
        <VisibilityContainer>
          <StyledImageWrapper className={'visible'}>
            <StyledImage
              src={cachedUrls[tokenId]?.url}
              height={dimensions?.height ?? 600}
              width={dimensions?.width ?? 600}
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

  @media only screen and ${breakpoints.tablet} {
    justify-content: center;
    align-items: center;
  }
`;

const VisibilityContainer = styled.div`
  margin-left: 84px;
  position: relative;
`;

const StyledTextContainer = styled(VStack)`
  margin-left: 56px;
`;

export const StyledNftSkeleton = styled(Skeleton)`
  width: 500px;
  height: 500px;

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
