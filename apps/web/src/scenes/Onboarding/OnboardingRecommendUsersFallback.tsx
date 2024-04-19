import Skeleton from 'react-loading-skeleton';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { HStack, VStack } from '~/components/core/Spacer/Stack';

export function OnboardingRecommendUsersFallback() {
  return (
    <StyledFullPageLoader>
      <StyledContainer gap={20}>
        <StyledThinSkeleton />
        <StyledThinSkeleton />
        <RecommendUsersFallback />
        <RecommendUsersFallback />
        <RecommendUsersFallback />
        <RecommendUsersFallback />
        <RecommendUsersFallback />
        <RecommendUsersFallback />
        <StyledThinSkeleton />
      </StyledContainer>
    </StyledFullPageLoader>
  );
}

function RecommendUsersFallback() {
  return (
    <>
      <HStack justify="space-between" align="center">
        <HStack gap={16} align="center">
          <StyledPfpSkeleton />
          <VStack gap={8}>
            <UserDetailsSmall />
            <UserDetails />
          </VStack>
        </HStack>
        <StyledButtonSkeleton />
      </HStack>
    </>
  );
}

const StyledFullPageLoader = styled.div`
  display: flex;
  height: 100vh;
  width: 100%;
  justify-content: center;
  align-items: center;

  flex-direction: column;
  padding-left: 24px;
  padding-right: 24px;
  margin-top: 48px;

  @media only screen and ${breakpoints.tablet} {
    padding: 0;
    flex-direction: row;
    margin-top: 0;
  }
`;

const StyledContainer = styled(VStack)`
  width: 100%;
  margin-top: 24px;

  @media only screen and ${breakpoints.tablet} {
    margin-top: 56px;
    padding-right: 10%;
    padding-left: 10%;
    width: 400px;
    margin-left: 46px;
    margin-top: 0px;
    padding-right: 0%;
    padding-left: 0%;
    width: auto;
  }
`;

const StyledPfpSkeleton = styled(Skeleton)`
  width: 38px;
  height: 38px;
  border-radius: 9999px;
`;

const StyledThinSkeleton = styled(Skeleton)`
  width: 100%;
  height: 40px;

  @media only screen and ${breakpoints.tablet} {
    width: 440px;
  }
`;

const UserDetailsSmall = styled(Skeleton)`
  width: 100%;
  height: 18px;

  @media only screen and ${breakpoints.tablet} {
    width: 100px;
  }
`;

const UserDetails = styled(Skeleton)`
  width: 100%;
  height: 16px;

  @media only screen and ${breakpoints.tablet} {
    width: 150px;
  }
`;

const StyledButtonSkeleton = styled(Skeleton)`
  width: 100%;
  height: 32px;

  @media only screen and ${breakpoints.tablet} {
    width: 110px;
  }
`;
