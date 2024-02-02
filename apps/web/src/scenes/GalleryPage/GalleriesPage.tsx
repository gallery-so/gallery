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
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arraySwap, rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { VStack } from '~/components/core/Spacer/Stack';
import Gallery, { GalleryOrderDirection } from '~/components/MultiGallery/Gallery';
import useUpdateGalleryOrder from '~/components/MultiGallery/useUpdateGalleryOrder';
import { GalleriesPageQueryFragment$key } from '~/generated/GalleriesPageQueryFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import { GalleryPageSpacing } from '~/pages/[username]';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { MobileSpacingContainer } from '../UserGalleryPage/UserGallery';
import UserGalleryHeader from '../UserGalleryPage/UserGalleryHeader';

type Props = {
  queryRef: GalleriesPageQueryFragment$key;
};

export default function GalleriesPage({ queryRef }: Props) {
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
          ...UserGalleryHeaderFragment
        }
        ...GalleryFragmentQuery
        ...UserGalleryHeaderQueryFragment
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

  const layoutMeasuring = useMemo(() => {
    return {
      droppable: {
        strategy: MeasuringStrategy.Always,
      },
    };
  }, []);

  const dropAnimation: DropAnimation = useMemo(() => {
    return {
      sideEffects: defaultDropAnimationSideEffects({
        styles: {
          active: {
            opacity: '0.2',
          },
        },
      }),
    };
  }, []);

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
          position: index.toString(),
        };
      });

      updateGalleryOrder(formattedGalleriesPosition);
    },
    [activeIndex, getIndex, sortedGalleryIds, updateGalleryOrder]
  );

  const handleOrderOnMobile = useCallback(
    (galleryId: string, direction: GalleryOrderDirection) => {
      const currentIndex = sortedGalleryIds.findIndex((id) => id === galleryId);

      if (
        (currentIndex === 0 && direction === 'up') ||
        (currentIndex === sortedGalleryIds.length - 1 && direction === 'down')
      ) {
        return;
      }

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      const newSortedGalleryIds = arraySwap(sortedGalleryIds, currentIndex, newIndex);
      setSortedGalleryIds(newSortedGalleryIds);

      const formattedGalleriesPosition = newSortedGalleryIds.map((galleryId, index) => {
        return {
          galleryId: galleryId,
          position: index.toString(),
        };
      });

      updateGalleryOrder(formattedGalleriesPosition);
    },
    [sortedGalleryIds, updateGalleryOrder]
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

  // This is here to ensure the user can click icons without
  // immediately triggering the drag n drop flow
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 100,
      },
    })
  );
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  return (
    <GalleryPageSpacing>
      <VStack gap={isMobile ? 12 : 24}>
        {query.userByUsername && (
          <UserGalleryHeader queryRef={query} userRef={query.userByUsername} />
        )}
        <MobileSpacingContainer>
          <DndContext
            sensors={sensors}
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
                      onGalleryOrderChange={handleOrderOnMobile}
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
                    isFeatured={featuredGalleryId === `Gallery:${activeId}`}
                  />
                )}
              </DragOverlay>,
              document.body
            )}
          </DndContext>
        </MobileSpacingContainer>
      </VStack>
    </GalleryPageSpacing>
  );
}

const GalleryWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(1, minmax(1fr));
  gap: 16px;

  @media only screen and ${breakpoints.tablet} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media only screen and ${breakpoints.desktop} {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`;
