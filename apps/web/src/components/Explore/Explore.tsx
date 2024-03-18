import { Suspense } from 'react';
import styled from 'styled-components';

import { VStack } from '../core/Spacer/Stack';
import FeaturedUsers, { FeaturedUsersLoadingSkeleton } from './FeaturedUsers';
import GallerySelects from './GallerySelects';

export default function Explore() {
  return (
    <StyledExplorePage gap={48}>
      <GallerySelects />
      <Suspense fallback={<FeaturedUsersLoadingSkeleton />}>
        <FeaturedUsers />
      </Suspense>
    </StyledExplorePage>
  );
}

const StyledExplorePage = styled(VStack)`
  width: 100%;
  flex: 1;
  padding: 16px 0;
`;
