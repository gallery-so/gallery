import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { DragItem } from '~/components/GalleryEditor/Draggable';

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
  isDragging: boolean;
  setIsDragging: (value: boolean) => void;
  coordinates: ItemCoordinates[];
  onLayoutUpdates: (value: ItemCoordinates) => void;
  onGestureUpdate: (value: DragItem, cursor: { x: number; y: number }) => void;

  getCoordinates: (id: string) => ItemCoordinates | undefined;
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
  const { moveRow, moveSection } = useGalleryEditorActions();

  const [isDragging, setIsDragging] = useState(false);
  const [itemsCoordinates, setItemsCoordinates] = useState<ItemCoordinates[]>([]);

  const handleToggleIsDragging = useCallback((value: boolean) => {
    setIsDragging(value);
  }, []);

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
    (value: DragItem, cursor: { x: number; y: number }) => {
      // Find the item that is below the cursor
      const item = itemsCoordinates.find(
        (item) =>
          item.id !== value.id &&
          cursor.x >= item.x &&
          cursor.x <= item.x + item.width &&
          cursor.y >= item.y &&
          cursor.y <= item.y + item.height &&
          item.type === value.type
      );

      if (!item) {
        return;
      }

      if (item.type === 'row') {
        moveRow(value.id, item.id);
        return;
      }

      if (item.type === 'section') {
        moveSection(value.id, item.id);
        return;
      }
    },
    [itemsCoordinates, moveRow, moveSection]
  );

  const handleGetCoordinates = useCallback(
    (id: string) => {
      return itemsCoordinates.find((item) => item.id === id);
    },
    [itemsCoordinates]
  );

  const value = useMemo(
    () => ({
      isDragging,
      setIsDragging: handleToggleIsDragging,

      coordinates: itemsCoordinates,
      onLayoutUpdates: handleLayoutUpdates,

      onGestureUpdate: handleGestureUpdate,

      getCoordinates: handleGetCoordinates,
    }),
    [
      handleGestureUpdate,
      handleLayoutUpdates,
      handleToggleIsDragging,
      isDragging,
      itemsCoordinates,
      handleGetCoordinates,
    ]
  );

  return (
    <GalleryDraggableActionsContext.Provider value={value}>
      {children}
    </GalleryDraggableActionsContext.Provider>
  );
};

GalleryDraggableProvider.displayName = 'GalleryDraggableProvider';

export default GalleryDraggableProvider;
