import {
  DndProvider,
  DndProviderProps,
  Draggable,
  DraggableStack,
  DraggableStackProps,
} from '@mgcrea/react-native-dnd';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { runOnJS } from 'react-native-reanimated';
import { graphql, useFragment } from 'react-relay';

import { useGalleryEditorActions } from '~/contexts/GalleryEditor/GalleryEditorContext';
import { DraggableSectionStackFragment$key } from '~/generated/DraggableSectionStackFragment.graphql';
import { RootStackNavigatorParamList, RootStackNavigatorProp } from '~/navigation/types';

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
  const navigation = useNavigation<RootStackNavigatorProp>();

  const { activeRowId, sections, moveRow, updateSectionOrder, toggleTokensStaged } =
    useGalleryEditorActions();
  const route = useRoute<RouteProp<RootStackNavigatorParamList, 'GalleryEditor'>>();

  useEffect(() => {
    if (route.params.stagedTokens) {
      toggleTokensStaged(route.params.stagedTokens);

      // remove the staged tokens from the route params
      // to prevent them from being used again
      navigation.setParams({
        stagedTokens: null,
      });
    }
  }, [navigation, route.params.stagedTokens, toggleTokensStaged]);

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
