import React from 'react';
import Skeleton from 'react-loading-skeleton';
import colors from 'shared/theme/colors';
import styled from 'styled-components';

import { GalleryPageSpacing } from '~/pages/[username]';

import breakpoints from '../core/breakpoints';
import { VStack } from '../core/Spacer/Stack';

const GallerySkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Wrapper = styled.div`
  padding-left: 20px;
`;

const TitleSkeleton = styled(Skeleton)`
  margin-top: 20px;
  width: 15vw;
  height: 2vh;
`;

const UsernameSkeleton = styled(Skeleton)`
  margin-top: 10px;
  width: 15vw;
  height: 2vh;
`;

const UsernameFollowsSkeleton = styled(Skeleton)`
  margin-top: 18px;
  width: 20vw;
  height: 2vh;
`;

const UsernameSocialsSkeleton = styled(Skeleton)`
  margin-top: 10px;
  width: 10vw;
  height: 2vh;
`;

const ArtworksGridSkeleton = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 16px;
  margin-top: 16px;
`;

const ArtworkGridItemSkeleton = styled(Skeleton)`
  height: 300px;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${colors.porcelain};
  display: none;
  margin-top: 60px;

  @media only screen and ${breakpoints.desktop} {
    display: block;
  }
`;

const UserGallerySkeleton = () => {
  return (
    <GalleryPageSpacing>
      <VStack>
        <GallerySkeletonWrapper>
          <Wrapper>
            <UsernameSkeleton />
            <UsernameFollowsSkeleton />
            <UsernameSocialsSkeleton />
          </Wrapper>
          <Divider />
        </GallerySkeletonWrapper>
      </VStack>
      <Wrapper>
        <TitleSkeleton />
        <ArtworksGridSkeleton>
          {[...Array(6)].map((_, index) => (
            <ArtworkGridItemSkeleton key={index} />
          ))}
        </ArtworksGridSkeleton>
      </Wrapper>
    </GalleryPageSpacing>
  );
};

export function ProfileScreenLoadingSkeleton() {
  return <UserGallerySkeleton />;
}
