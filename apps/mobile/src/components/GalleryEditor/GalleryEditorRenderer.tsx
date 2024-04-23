import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useEffect, useMemo } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, View } from 'react-native';
import { useAnimatedRef, useSharedValue } from 'react-native-reanimated';
import { graphql, useFragment } from 'react-relay';

import { useGalleryEditorActions } from '~/contexts/GalleryEditor/GalleryEditorContext';
import { StagedSection } from '~/contexts/GalleryEditor/types';
import { GalleryEditorHeaderFragment$key } from '~/generated/GalleryEditorHeaderFragment.graphql';
import { GalleryEditorRendererFragment$key } from '~/generated/GalleryEditorRendererFragment.graphql';
import { GalleryEditorRendererQueryFragment$key } from '~/generated/GalleryEditorRendererQueryFragment.graphql';
import { GalleryEditorSectionFragment$key } from '~/generated/GalleryEditorSectionFragment.graphql';
import { RootStackNavigatorParamList, RootStackNavigatorProp } from '~/navigation/types';

import { useSafeAreaPadding } from '../SafeAreaViewWithPadding';
import { GalleryEditorHeader } from './GalleryEditorHeader';
import { GalleryEditorNavbar } from './GalleryEditorNavbar';
import { GalleryEditorSection } from './GalleryEditorSection';

export type ListItemType =
  | { kind: 'navigation'; title: string }
  | { kind: 'header'; galleryRef: GalleryEditorHeaderFragment$key }
  | { kind: 'section'; section: StagedSection; queryRef: GalleryEditorSectionFragment$key };

type Props = {
  galleryRef: GalleryEditorRendererFragment$key;
  queryRef: GalleryEditorRendererQueryFragment$key;
};

export function GalleryEditorRenderer({ galleryRef, queryRef }: Props) {
  const gallery = useFragment(
    graphql`
      fragment GalleryEditorRendererFragment on Gallery {
        ...GalleryEditorHeaderFragment
      }
    `,
    galleryRef
  );

  const query = useFragment(
    graphql`
      fragment GalleryEditorRendererQueryFragment on Query {
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

  const scrollContentOffsetY = useSharedValue(0);
  const ref = useAnimatedRef<FlashList<ListItemType>>();

  const renderItem = useCallback<ListRenderItem<ListItemType>>(
    ({ item }) => {
      if (item.kind === 'header') {
        return <GalleryEditorHeader galleryRef={item.galleryRef} />;
      } else if (item.kind === 'navigation') {
        return <GalleryEditorNavbar />;
      } else if (item.kind === 'section') {
        return (
          <GalleryEditorSection
            section={item.section}
            queryRef={item.queryRef}
            scrollContentOffsetY={scrollContentOffsetY}
            scrollViewRef={ref}
          />
        );
      } else {
        return null;
      }
    },
    [ref, scrollContentOffsetY]
  );

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollContentOffsetY.value = e.nativeEvent.contentOffset.y;
    },
    [scrollContentOffsetY]
  );

  return (
    <View
      className="flex flex-col flex-1 bg-white dark:bg-black-900"
      style={{
        paddingTop: top,
      }}
    >
      <FlashList
        ref={ref}
        data={items}
        renderItem={renderItem}
        estimatedItemSize={93}
        onScroll={handleScroll}
      />
    </View>
  );
}
