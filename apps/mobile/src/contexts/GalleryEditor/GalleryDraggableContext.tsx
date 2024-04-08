import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { useGalleryEditorActions } from './GalleryEditorContext';

export type ItemCoordinates = {
  id: string; // unique id of the item
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'section' | 'row';
};

type GalleryDraggableActions = {
  coordinates: ItemCoordinates[];
  onLayoutUpdates: (value: ItemCoordinates) => void;
  onGestureUpdate: (activeId: string, cursor: { x: number; y: number }) => void;
};

const GalleryDraggableActionsContext = createContext<GalleryDraggableActions | undefined>(
  undefined
);

export const useGalleryDraggableActions = (): GalleryDraggableActions => {
  const context = useContext(GalleryDraggableActionsContext);
  if (context === undefined) {
    throw new Error(
      'useGalleryDraggableActions must be used within a GalleryDraggableActionsProvider'
    );
  }
  return context;
};

type Props = {
  children: React.ReactNode;
};

const GalleryDraggableProvider = ({ children }: Props) => {
  const { moveSection } = useGalleryEditorActions();

  const [itemsCoordinates, setItemsCoordinates] = useState<ItemCoordinates[]>([]);

  const handleLayoutUpdates = useCallback(
    (value: ItemCoordinates) => {
      setItemsCoordinates((prev) => {
        const index = prev.findIndex((item) => item.id === value.id);
        if (index !== -1) {
          // Replace the item if it already exists
          return [...prev.slice(0, index), value, ...prev.slice(index + 1)];
        } else {
          // Add the new item
          return [...prev, value];
        }
      });
    },
    [setItemsCoordinates]
  );

  const handleGestureUpdate = useCallback(
    (activeId: string, cursor: { x: number; y: number }) => {
      // Find the item that is below the cursor
      const item = itemsCoordinates.find(
        (item) =>
          item.id !== activeId &&
          cursor.x >= item.x &&
          cursor.x <= item.x + item.width &&
          cursor.y >= item.y &&
          cursor.y <= item.y + item.height
      );

      if (!item) {
        return;
      }

      //   Assume we are moving sections
      moveSection(activeId, item.id);
    },
    [itemsCoordinates, moveSection]
  );

  const value = useMemo(
    () => ({
      coordinates: itemsCoordinates,
      onLayoutUpdates: handleLayoutUpdates,

      onGestureUpdate: handleGestureUpdate,
    }),
    [handleGestureUpdate, handleLayoutUpdates, itemsCoordinates]
  );

  return (
    <GalleryDraggableActionsContext.Provider value={value}>
      {children}
    </GalleryDraggableActionsContext.Provider>
  );
};

GalleryDraggableProvider.displayName = 'GalleryDraggableProvider';

export default GalleryDraggableProvider;
