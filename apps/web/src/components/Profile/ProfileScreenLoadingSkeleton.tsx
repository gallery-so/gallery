import React from 'react';
import Skeleton from 'react-loading-skeleton';
import styled from 'styled-components';

import { GalleryPageSpacing } from '~/pages/[username]';

import { VStack } from '../core/Spacer/Stack';

const GallerySkeletonWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Wrapper = styled.div`
  padding-left: 20px;
  margin-bottom: 60px;
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
