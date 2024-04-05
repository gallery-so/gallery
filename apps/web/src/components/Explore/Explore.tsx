import { Suspense } from 'react';
import styled from 'styled-components';

import { CmsTypes } from '~/scenes/ContentPages/cms_types';

import { VStack } from '../core/Spacer/Stack';
import FeaturedUsers, { FeaturedUsersLoadingSkeleton } from './FeaturedUsers';
import GallerySelects from './GallerySelects';

type Props = {
  gallerySelectsContent: CmsTypes.ExplorePageGallerySelectsList;
};

export default function Explore({ gallerySelectsContent }: Props) {
  return (
    <StyledExplorePage gap={48}>
      <GallerySelects gallerySelectsContent={gallerySelectsContent} />
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
