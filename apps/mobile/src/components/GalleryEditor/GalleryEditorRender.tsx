import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { useGalleryEditorActions } from '~/contexts/GalleryEditor/GalleryEditorContext';
import { StagedSection } from '~/contexts/GalleryEditor/types';
import { GalleryEditorHeaderFragment$key } from '~/generated/GalleryEditorHeaderFragment.graphql';
import { GalleryEditorRenderFragment$key } from '~/generated/GalleryEditorRenderFragment.graphql';
import { GalleryEditorRenderQueryFragment$key } from '~/generated/GalleryEditorRenderQueryFragment.graphql';
import { GalleryEditorSectionFragment$key } from '~/generated/GalleryEditorSectionFragment.graphql';
import { RootStackNavigatorParamList, RootStackNavigatorProp } from '~/navigation/types';

import { useSafeAreaPadding } from '../SafeAreaViewWithPadding';
import { GalleryEditorHeader } from './GalleryEditorHeader';
import { GalleryEditorNavbar } from './GalleryEditorNavbar';
import { GalleryEditorSection } from './GalleryEditorSection';

type ListItemType =
  | { kind: 'navigation'; title: string }
  | { kind: 'header'; galleryRef: GalleryEditorHeaderFragment$key }
  | { kind: 'section'; section: StagedSection; queryRef: GalleryEditorSectionFragment$key };

type Props = {
  galleryRef: GalleryEditorRenderFragment$key;
  queryRef: GalleryEditorRenderQueryFragment$key;
};

export function GalleryEditorRender({ galleryRef, queryRef }: Props) {
  const gallery = useFragment(
    graphql`
      fragment GalleryEditorRenderFragment on Gallery {
        ...GalleryEditorHeaderFragment
      }
    `,
    galleryRef
  );

  const query = useFragment(
    graphql`
      fragment GalleryEditorRenderQueryFragment on Query {
        ...GalleryEditorSectionFragment
      }
    `,
    queryRef
  );

  const { sections, toggleTokensStaged } = useGalleryEditorActions();
  const { top } = useSafeAreaPadding();

  const navigation = useNavigation<RootStackNavigatorProp>();
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

  const items = useMemo((): ListItemType[] => {
    const items: ListItemType[] = [];
    items.push({
      kind: 'navigation',
      title: 'Navigation',
    });
    items.push({
      kind: 'header',
      galleryRef: gallery,
    });

    sections.forEach((section) => {
      items.push({
        kind: 'section',
        section,
        queryRef: query,
      });
    });

    return items;
  }, [gallery, sections, query]);

  const renderItem = useCallback<ListRenderItem<ListItemType>>(({ item }) => {
    if (item.kind === 'header') {
      return <GalleryEditorHeader galleryRef={item.galleryRef} />;
    } else if (item.kind === 'navigation') {
      return <GalleryEditorNavbar />;
    } else if (item.kind === 'section') {
      return <GalleryEditorSection section={item.section} queryRef={item.queryRef} />;
    } else {
      return null;
    }
  }, []);

  return (
    <View
      className="flex flex-col flex-1 bg-white dark:bg-black-900"
      style={{
        paddingTop: top,
      }}
    >
      <FlashList data={items} renderItem={renderItem} estimatedItemSize={93} />
    </View>
  );
}
