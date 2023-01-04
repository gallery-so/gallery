import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import Gallery from '~/components/MultiGallery/Gallery';
import { useGlobalNavbarHeight } from '~/contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DndContext } from '@dnd-kit/core';
import { graphql, useFragment } from 'react-relay';
import { GalleriesPageQueryFragment$key } from '~/generated/GalleriesPageQueryFragment.graphql';

type Props = {
  queryRef: GalleriesPageQueryFragment$key;
};

export default function GalleriesPage({ queryRef }: Props) {
  const navbarHeight = useGlobalNavbarHeight();

  // const galleries = ['1', '2', '3', '4', '5', '6'];

  const query = useFragment(
    graphql`
      fragment GalleriesPageQueryFragment on Query {
        viewer {
          ... on Viewer {
            user {
              dbid
              galleries {
                id
                ...GalleryFragment
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const galleries = query.viewer?.user?.galleries ?? [];

  if (galleries.length < 1) return null;

  return (
    <GalleryPageWrapper navbarHeight={navbarHeight}>
      <GalleryWrapper>
        {galleries.map((gallery) => {
          // @ts-ignore
          return <Gallery key={gallery.id} queryRef={gallery} />;
        })}

        {/* <DndContext>
          <SortableContext items={galleries} strategy={verticalListSortingStrategy}>
            {galleries.map((gallery) => {
              return <Gallery key={gallery} />;
            })}
          </SortableContext>
        </DndContext> */}
        {/* <Gallery isFeatured />
        <Gallery isHidden /> */}
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
    grid-template-columns: repeat(4, 1fr);
  }
`;
