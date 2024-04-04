import {
  DndProvider,
  DndProviderProps,
  Draggable,
  DraggableStack,
  DraggableStackProps,
} from '@mgcrea/react-native-dnd';
import { View } from 'react-native';
import { runOnJS } from 'react-native-reanimated';

import { useGalleryEditorActions } from '~/contexts/GalleryEditor/GalleryEditorContext';

import { GalleryEditorSection } from './GalleryEditorSection';

export function DraggableCollectionStack() {
  const { sections, moveRow, updateSectionOrder } = useGalleryEditorActions();

  const onStackOrderChange: DraggableStackProps['onOrderChange'] = (value) => {
    updateSectionOrder(value);
  };

  const handleDragEnd: DndProviderProps['onDragEnd'] = ({ active, over }) => {
    'worklet';
    if (over) {
      runOnJS(moveRow)(active.data.value.sectionId, active.id.toString(), over.id.toString());
    }
  };

  return (
    <View className="px-2">
      <DndProvider onDragEnd={handleDragEnd} activationDelay={300}>
        <DraggableStack direction="column" gap={16} onOrderChange={onStackOrderChange}>
          {sections.map((section, index) => (
            <Draggable key={section.dbid + index} id={section.dbid}>
              <GalleryEditorSection section={section} />
            </Draggable>
          ))}
        </DraggableStack>
      </DndProvider>
    </View>
  );
}
