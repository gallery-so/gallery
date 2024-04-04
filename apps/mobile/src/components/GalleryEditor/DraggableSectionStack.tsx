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
import { graphql, useFragment } from 'react-relay';

import { useGalleryEditorActions } from '~/contexts/GalleryEditor/GalleryEditorContext';
import { DraggableSectionStackFragment$key } from '~/generated/DraggableSectionStackFragment.graphql';

import { GalleryEditorSection } from './GalleryEditorSection';

type Props = {
  queryRef: DraggableSectionStackFragment$key;
};

export function DraggableSectionStack({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment DraggableSectionStackFragment on Query {
        ...GalleryEditorSectionFragment
      }
    `,
    queryRef
  );

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
              <GalleryEditorSection section={section} queryRef={query} />
            </Draggable>
          ))}
        </DraggableStack>
      </DndProvider>
    </View>
  );
}
