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
        userByUsername(username: $username) {
          ... on GalleryUser {
            id
            featuredGallery {
              id
            }
            galleries {
              dbid
              id
              position @required(action: NONE)
              ...GalleryFragment
            }
          }
        }
        ...GalleryFragmentQuery
      }
    `,
    queryRef
  );

  const nonNullGalleries = useMemo(() => {
    return removeNullValues(query.userByUsername?.galleries);
  }, [query.userByUsername?.galleries]);

  const user = query.userByUsername;

  const [sortedGalleryIds, setSortedGalleryIds] = useState(
    nonNullGalleries
      .sort((a, b) => {
        return a.position.localeCompare(b.position);
      })
      .map((gallery) => gallery.dbid)
  );

  const featuredGalleryId = user?.featuredGallery?.id ?? null;

  const updateGalleryOrder = useUpdateGalleryOrder();

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const getIndex = useCallback(
    (id: UniqueIdentifier) => sortedGalleryIds.findIndex((galleryId) => galleryId === id),
    [sortedGalleryIds]
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
          setSortedGalleryIds((items) => arraySwap(items, activeIndex, overIndex));
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
          setSortedGalleryIds((items) => arraySwap(items, activeIndex, overIndex));
        }
      }

      const formattedGalleriesPosition = sortedGalleryIds.map((galleryId, index) => {
        return {
          galleryId: galleryId,
          position: `a${index.toString()}`,
        };
      });

      updateGalleryOrder(formattedGalleriesPosition);
    },
    [activeIndex, getIndex, sortedGalleryIds, updateGalleryOrder]
  );

  const sortedGalleries = useMemo(() => {
    return removeNullValues(
      sortedGalleryIds.map((galleryId) => {
        return nonNullGalleries.find((gallery) => gallery.dbid === galleryId);
      })
    );
  }, [nonNullGalleries, sortedGalleryIds]);

  const activeGallery = useMemo(
    () => nonNullGalleries.find((gallery) => gallery.dbid === activeId),
    [activeId, nonNullGalleries]
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
        <SortableContext items={sortedGalleryIds} strategy={rectSortingStrategy}>
          <GalleryWrapper>
            {sortedGalleries.map((gallery) => {
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
            {activeGallery && (
              <Gallery
                key={activeGallery.dbid}
                galleryRef={activeGallery}
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
