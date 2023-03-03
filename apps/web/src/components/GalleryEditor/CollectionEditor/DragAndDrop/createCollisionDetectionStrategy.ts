import {
  closestCenter,
  Collision,
  CollisionDetection,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
  UniqueIdentifier,
} from '@dnd-kit/core';
import { MutableRefObject } from 'react';

import { StagedSectionMap } from '~/components/GalleryEditor/GalleryEditorContext';

type createCollisionDetectionStrategyArgs = {
  activeId: UniqueIdentifier | null;
  localSections: StagedSectionMap;
  lastOverId: MutableRefObject<UniqueIdentifier | null>;
  recentlyMovedToNewContainer: MutableRefObject<boolean | null>;
};

/**
 * Custom collision detection strategy optimized for multiple containers
 *
 * - First, find any droppable containers intersecting with the pointer.
 * - If there are none, find intersecting containers with the active draggable.
 * - If there are no intersecting containers, return the last matched intersection
 *
 */
export function createCollisionDetectionStrategy({
  activeId,
  lastOverId,
  localSections,
  recentlyMovedToNewContainer,
}: createCollisionDetectionStrategyArgs) {
  return (args: Parameters<CollisionDetection>[0]): Collision[] => {
    const localSectionIds = localSections.map((section) => section.id);

    // handle collisions when dragging sections
    if (activeId && activeId in localSectionIds) {
      console.log('This one');
      return closestCenter({
        ...args,
        droppableContainers: args.droppableContainers.filter(
          (section) => section.id in localSectionIds
        ),
      });
    }

    // Start by finding any intersecting droppable
    const pointerIntersections = pointerWithin(args);
    const intersections =
      pointerIntersections.length > 0
        ? // If there are droppables intersecting with the pointer, return those
          pointerIntersections
        : rectIntersection(args);

    let overId = getFirstCollision(intersections, 'id');
    if (overId) {
      const overSection = overId ? localSections.find((section) => section.id === overId) : null;
      if (overSection) {
        const sectionItems = overSection.items;

        // If a section is matched and it contains items (columns 'A', 'B', 'C')
        if (sectionItems.length > 0) {
          // Return the closest droppable within that section
          overId =
            closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (section) =>
                  section.id !== overId &&
                  sectionItems.map((item) => item.id).includes(section.id as string)
              ),
            })[0]?.id ?? null;
        }
      }

      lastOverId.current = overId;

      if (overId) {
        return [{ id: overId }];
      }
    }

    // When a draggable item moves to a new container, the layout may shift
    // and the `overId` may become `null`. We manually set the cached `lastOverId`
    // to the id of the draggable item that was moved to the new container, otherwise
    // the previous `overId` will be returned which can cause items to incorrectly shift positions
    if (recentlyMovedToNewContainer.current) {
      lastOverId.current = activeId;
    }

    // If no droppable is matched, return the last match
    return lastOverId.current ? [{ id: lastOverId.current }] : [];
  };
}
