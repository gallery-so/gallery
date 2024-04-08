import { DndProvider, DndProviderProps } from '@mgcrea/react-native-dnd';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useEffect } from 'react';
import { View } from 'react-native';
import { runOnJS } from 'react-native-reanimated';
import { graphql, useFragment } from 'react-relay';

import { useGalleryEditorActions } from '~/contexts/GalleryEditor/GalleryEditorContext';
import { DraggableSectionStackFragment$key } from '~/generated/DraggableSectionStackFragment.graphql';
import { RootStackNavigatorParamList, RootStackNavigatorProp } from '~/navigation/types';

import { Draggable } from './Draggable';
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

  const { sections, moveRow, toggleTokensStaged } = useGalleryEditorActions();
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

  const handleDragEnd: DndProviderProps['onDragEnd'] = ({ active, over }) => {
    'worklet';
    if (over) {
      runOnJS(moveRow)(active.data.value.sectionId, active.id.toString(), over.id.toString());
    }
  };

  return (
    <View className="px-2">
      <DndProvider onDragEnd={handleDragEnd} activationDelay={300}>
        {sections.map((section, index) => (
          <Draggable key={`${section.dbid}-${index}`} value={{ id: section.dbid, type: 'section' }}>
            <GalleryEditorSection section={section} queryRef={query} />
          </Draggable>
        ))}
      </DndProvider>
    </View>
  );
}
