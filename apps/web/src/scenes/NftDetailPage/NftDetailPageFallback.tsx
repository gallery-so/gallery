import Skeleton from 'react-loading-skeleton';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { HStack, VStack } from '~/components/core/Spacer/Stack';

export default function NftDetailPageFallback() {
  return (
    <StyledFullPageLoader>
      <StyledNftSkeleton />
      <VStack gap={24}>
        <StyledSkeleton />
        <StyledOwnerAndCreator>
          <VStack gap={2}>
            <StyledDetailsHeaderSkeleton />
          </VStack>

          <VStack gap={2}>
            <StyledDetailsHeaderSkeleton />
          </VStack>
        </StyledOwnerAndCreator>
        <StyledDescriptionSkeleton />
        <StyledThinSkeleton />
        <StyledSmallSkeleton />
        <StyledSmallSkeleton />
      </VStack>
    </StyledFullPageLoader>
  );
}

const StyledFullPageLoader = styled.div`
  display: flex;
  gap: 60px;
  height: 100vh;
  width: 100%;

  @media only screen and ${breakpoints.tablet} {
    justify-content: center;
    align-items: center;
  }
`;

const StyledNftSkeleton = styled(Skeleton)`
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

const StyledSmallSkeleton = styled(Skeleton)`
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

const StyledDetailsHeaderSkeleton = styled(Skeleton)`
  height: 50px;
  width: 65%;
`;

const StyledOwnerAndCreator = styled(HStack)`
  > ${VStack} {
    width: 50%;
  }
`;
