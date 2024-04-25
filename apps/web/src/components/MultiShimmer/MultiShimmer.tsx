import React from 'react';
import Skeleton from 'react-loading-skeleton';
import styled from 'styled-components';

import { size } from '../core/breakpoints';

const Wrapper = styled.div`
  margin-bottom: 60px;
  width: 100%;
`;

const ArtworksGridSkeleton = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 16px;
  margin-top: 16px;

  @media (max-width: ${size.tablet}px) {
    // Adjusts to a mobile viewport
    grid-template-columns: repeat(1, 1fr);
  }
`;

const ArtworkGridItemSkeleton = styled(Skeleton)`
  height: 300px;
`;

const SkeletoState = () => {
  return (
    <Wrapper>
      <ArtworksGridSkeleton>
        {[...Array(12)].map((_, index) => (
          <ArtworkGridItemSkeleton key={index} />
        ))}
      </ArtworksGridSkeleton>
    </Wrapper>
  );
};

export function MultiShimmer() {
  return <SkeletoState />;
}
