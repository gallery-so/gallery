import {
  DndProvider,
  DndProviderProps,
  Draggable,
  DraggableStack,
  DraggableStackProps,
} from '@mgcrea/react-native-dnd';
import { useMemo } from 'react';
import { View } from 'react-native';
import { runOnJS } from 'react-native-reanimated';

import { useGalleryEditorActions } from '~/contexts/GalleryEditor/GalleryEditorContext';

import { GalleryEditorSection } from './GalleryEditorSection';

export function DraggableSectionStack() {
  const { activeRowId, sections, moveRow, updateSectionOrder } = useGalleryEditorActions();

  const onStackOrderChange: DraggableStackProps['onOrderChange'] = (value) => {
    updateSectionOrder(value);
  };

  const handleDragEnd: DndProviderProps['onDragEnd'] = ({ active, over }) => {
    'worklet';
    if (over) {
      runOnJS(moveRow)(active.data.value.sectionId, active.id.toString(), over.id.toString());
    }
  };

  const disabledSectionDrag = useMemo(() => {
    return Boolean(activeRowId);
  }, [activeRowId]);

  return (
    <View className="px-2">
      <DndProvider onDragEnd={handleDragEnd} activationDelay={300}>
        <DraggableStack direction="column" gap={16} onOrderChange={onStackOrderChange}>
          {sections.map((section, index) => (
            <Draggable
              key={`${section.dbid}-${index}`}
              id={section.dbid}
              disabled={disabledSectionDrag}
            >
              <GalleryEditorSection section={section} />
            </Draggable>
          ))}
        </DraggableStack>
      </DndProvider>
    </View>
  );
}
