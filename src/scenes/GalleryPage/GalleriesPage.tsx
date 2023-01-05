import { DndContext } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import Gallery from '~/components/MultiGallery/Gallery';
import { useGlobalNavbarHeight } from '~/contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';
import { GalleriesPageQueryFragment$key } from '~/generated/GalleriesPageQueryFragment.graphql';
import { removeNullValues } from '~/utils/removeNullValues';

type Props = {
  queryRef: GalleriesPageQueryFragment$key;
};

export default function GalleriesPage({ queryRef }: Props) {
  const navbarHeight = useGlobalNavbarHeight();

  const query = useFragment(
    graphql`
      fragment GalleriesPageQueryFragment on Query {
        userByUsername(username: $username) {
          ... on GalleryUser {
            featuredGallery {
              id
            }
            galleries {
              id
              hidden
              ...GalleryFragment
            }
          }
        }
        ...useLoggedInUserIdFragment
      }
    `,
    queryRef
  );

  const user = query.userByUsername;
  const galleries = removeNullValues(user?.galleries) ?? [];

  const featuredGalleryId = user?.featuredGallery?.id ?? null;
  const featuredGallery = galleries.find((gallery) => gallery.id === featuredGalleryId);

  // sort by hidden
  const nonFeaturedGalleries = galleries
    .filter((gallery) => gallery.id !== featuredGalleryId)
    .sort((a, b) => {
      if (a.hidden && !b.hidden) {
        return 1;
      } else if (!a.hidden && b.hidden) {
        return -1;
      } else {
        return 0;
      }
    });

  return (
    <GalleryPageWrapper navbarHeight={navbarHeight}>
      <GalleryWrapper>
        {featuredGallery && (
          <Gallery queryRef={query} galleryRef={featuredGallery} isFeatured={true} />
        )}
        {nonFeaturedGalleries.map((gallery) => {
          return (
            <Gallery
              key={gallery.id}
              galleryRef={gallery}
              queryRef={query}
              isFeatured={featuredGalleryId === gallery.id}
            />
          );
        })}

        {/* <DndContext>
          <SortableContext items={galleries} strategy={verticalListSortingStrategy}>
            {galleries.map((gallery) => {
              return <Gallery key={gallery} />;
            })}
          </SortableContext>
        </DndContext> */}
      </GalleryWrapper>
    </GalleryPageWrapper>
  );
}

const GalleryPageWrapper = styled.div<{ navbarHeight: number }>`
  height: calc(100vh - ${({ navbarHeight }) => navbarHeight}px);
  padding: ${({ navbarHeight }) => navbarHeight}px 16px 0;
`;

const GalleryWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;

  @media only screen and ${breakpoints.tablet} {
    grid-template-columns: repeat(3, 1fr);
  }
  @media only screen and ${breakpoints.desktop} {
    grid-template-columns: repeat(4, 1fr);
  }
`;
