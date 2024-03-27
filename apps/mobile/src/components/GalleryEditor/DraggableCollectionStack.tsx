import {
  DndProvider,
  DndProviderProps,
  Draggable,
  DraggableStack,
  DraggableStackProps,
} from '@mgcrea/react-native-dnd';
import { View } from 'react-native';
import { State } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { useGalleryEditorActions } from '~/contexts/GalleryEditor/GalleryEditorContext';

import { GalleryEditorSection } from './GalleryEditorSection';

export function DraggableCollectionStack() {
  const { collections, moveRow } = useGalleryEditorActions();

  const onStackOrderChange: DraggableStackProps['onOrderChange'] = (value) => {
    console.log('onStackOrderChange', value);
  };
  const onStackOrderUpdate: DraggableStackProps['onOrderUpdate'] = (value) => {
    console.log('onStackOrderUpdate', value);
  };

  const handleDragEnd: DndProviderProps['onDragEnd'] = ({ active, over }) => {
    'worklet';
    if (over) {
      console.log('onDragEnd');
      runOnJS(moveRow)(
        active.id.toString(),
        // active.data.value.sectionId,
        over.id.toString()
        // over.data.value.sectionId
      );
    }
  };

  const handleBegin: DndProviderProps['onBegin'] = () => {
    'worklet';
    console.log('onBegin');
  };

  const handleFinalize: DndProviderProps['onFinalize'] = ({ state }) => {
    'worklet';
    console.log('onFinalize');
    if (state !== State.FAILED) {
      console.log('onFinalize');
    }
  };

  return (
    <View className="px-2">
      <DndProvider
        onBegin={handleBegin}
        onFinalize={handleFinalize}
        onDragEnd={handleDragEnd}
        activationDelay={300}
      >
        <DraggableStack
          direction="column"
          gap={16}
          onOrderChange={onStackOrderChange}
          onOrderUpdate={onStackOrderUpdate}
        >
          {collections.map((collection) => (
            <Draggable key={collection.dbid} id={collection.dbid}>
              <GalleryEditorSection collection={collection} />
            </Draggable>
          ))}
        </DraggableStack>
      </DndProvider>
    </View>
  );
}
