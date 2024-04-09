import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useEffect } from 'react';
import { View } from 'react-native';
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

  const { sectionIdBeingEdited, sections, toggleTokensStaged, activeRowId } =
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

  return (
    <View className="px-2">
      {sections.map((section, index) => (
        <Draggable
          key={`${section.dbid}-${index}`}
          value={{ id: section.dbid, type: 'section' }}
          disabled={section.dbid !== sectionIdBeingEdited || Boolean(activeRowId)}
        >
          <GalleryEditorSection section={section} queryRef={query} />
        </Draggable>
      ))}
    </View>
  );
}
