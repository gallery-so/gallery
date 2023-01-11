import {
  closestCenter,
  defaultDropAnimationSideEffects,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  MeasuringStrategy,
  UniqueIdentifier,
} from '@dnd-kit/core';
import { arraySwap, rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import Gallery from '~/components/MultiGallery/Gallery';
import useUpdateGalleryOrder from '~/components/MultiGallery/useUpdateGalleryOrder';
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
        viewer {
          ... on Viewer {
            viewerGalleries {
              gallery {
                id
                position
                ...GalleryFragment
              }
            }
          }
        }

        userByUsername(username: $username) {
          ... on GalleryUser {
            id
            featuredGallery {
              id
            }
          }
        }
        ...GalleryFragmentQuery
      }
    `,
    queryRef
  );

  const viewerGalleries = useMemo(() => {
    return query.viewer?.viewerGalleries?.map((viewerGallery) => viewerGallery?.gallery) ?? [];
  }, [query.viewer?.viewerGalleries]);

  const user = query.userByUsername;

  const sortedGalleries = useMemo(() => {
    const galleries = removeNullValues(viewerGalleries) ?? [];

    return galleries.sort((a, b) => {
      if (!a.position || !b.position) {
        return 0;
      }

      if (a.position < b.position) {
        return -1;
      } else if (a.position > b.position) {
        return 1;
      } else {
        return 0;
      }
    });
  }, [viewerGalleries]);

  const [localGalleries, setLocalGalleries] = useState(sortedGalleries);

  const featuredGalleryId = user?.featuredGallery?.id ?? null;

  const updateGalleryOrder = useUpdateGalleryOrder();

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const getIndex = useCallback(
    (id: UniqueIdentifier) => localGalleries.findIndex((gallery) => gallery.id === id),
    [localGalleries]
  );

  const activeIndex = activeId ? getIndex(activeId) : -1;

  const layoutMeasuring = {
    droppable: {
      strategy: MeasuringStrategy.Always,
    },
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.2',
        },
      },
    }),
  };

  const handleDragStart = useCallback(({ active }: DragStartEvent) => {
    if (!active) {
      return;
    }
    setActiveId(active.id);
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;

      if (active && over) {
        const overIndex = getIndex(over.id);

        if (activeIndex !== overIndex) {
          setLocalGalleries((items) => arraySwap(items, activeIndex, overIndex));
        }
      }
    },
    [activeIndex, getIndex]
  );

  const handleDragEnd = useCallback(
    ({ over }: DragEndEvent) => {
      setActiveId(null);

      if (over) {
        const overIndex = getIndex(over.id);
        if (activeIndex !== overIndex) {
          setLocalGalleries((items) => arraySwap(items, activeIndex, overIndex));
        }
      }

      const formattedGalleriesPosition = localGalleries.map((gallery, index) => {
        return {
          galleryId: gallery.id,
          position: `a${index.toString()}`,
        };
      });

      updateGalleryOrder(formattedGalleriesPosition);
    },
    [activeIndex, getIndex, localGalleries, updateGalleryOrder]
  );

  return (
    <GalleryPageWrapper navbarHeight={navbarHeight}>
      <DndContext
        collisionDetection={closestCenter}
        measuring={layoutMeasuring}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext items={localGalleries} strategy={rectSortingStrategy}>
          <GalleryWrapper>
            {localGalleries.map((gallery) => {
              return (
                <Gallery
                  key={gallery.id}
                  galleryRef={gallery}
                  queryRef={query}
                  isFeatured={featuredGalleryId === gallery.id}
                />
              );
            })}
          </GalleryWrapper>
        </SortableContext>
        {createPortal(
          <DragOverlay dropAnimation={dropAnimation}>
            {activeId && (
              <Gallery
                key={activeId}
                galleryRef={localGalleries[activeIndex]}
                queryRef={query}
                isFeatured={featuredGalleryId === activeId}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
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
