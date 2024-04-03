import { DndProvider, DndProviderProps, Draggable, DraggableStack } from '@mgcrea/react-native-dnd';
import { View } from 'react-native';
import { runOnJS } from 'react-native-reanimated';

import { useGalleryEditorActions } from '~/contexts/GalleryEditor/GalleryEditorContext';

import { GalleryEditorSection } from './GalleryEditorSection';

export function DraggableCollectionStack() {
  const { collections, moveRow } = useGalleryEditorActions();

  // const onStackOrderChange: DraggableStackProps['onOrderChange'] = (value) => {
  //   console.log('onStackOrderChange', value);
  // };
  // const onStackOrderUpdate: DraggableStackProps['onOrderUpdate'] = (value) => {
  //   console.log('onStackOrderUpdate', value);
  // };

  const handleDragEnd: DndProviderProps['onDragEnd'] = ({ active, over }) => {
    'worklet';
    if (over) {
      runOnJS(moveRow)(active.data.value.sectionId, active.id.toString(), over.id.toString());
    }
  };

  // const handleBegin: DndProviderProps['onBegin'] = () => {
  //   'worklet';
  //   console.log('onBegin');
  // };

  // const handleFinalize: DndProviderProps['onFinalize'] = ({ state }) => {
  //   'worklet';
  //   console.log('onFinalize');
  //   if (state !== State.FAILED) {
  //     console.log('onFinalize');
  //   }
  // };

  return (
    <View className="px-2">
      <DndProvider onDragEnd={handleDragEnd} activationDelay={300}>
        <DraggableStack
          direction="column"
          gap={16}
          // onOrderChange={onStackOrderChange}
          // onOrderUpdate={onStackOrderUpdate}
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
