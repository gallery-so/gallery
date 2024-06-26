import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback, useEffect, useMemo } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, View } from 'react-native';
import { useAnimatedRef, useSharedValue } from 'react-native-reanimated';
import { graphql, useFragment } from 'react-relay';

import { useGalleryEditorActions } from '~/contexts/GalleryEditor/GalleryEditorContext';
import { StagedSection } from '~/contexts/GalleryEditor/types';
import { GalleryEditorRendererQueryFragment$key } from '~/generated/GalleryEditorRendererQueryFragment.graphql';
import { GalleryEditorSectionFragment$key } from '~/generated/GalleryEditorSectionFragment.graphql';
import { RootStackNavigatorParamList, RootStackNavigatorProp } from '~/navigation/types';

import { useSafeAreaPadding } from '../SafeAreaViewWithPadding';
import { GalleryEditorHeader } from './GalleryEditorHeader';
import { GalleryEditorNavbar } from './GalleryEditorNavbar';
import { GalleryEditorSection } from './GalleryEditorSection';

export type ListItemType =
  | { kind: 'navigation'; title: string }
  | { kind: 'header' }
  | { kind: 'section'; section: StagedSection; queryRef: GalleryEditorSectionFragment$key };

type Props = {
  queryRef: GalleryEditorRendererQueryFragment$key;
};

export function GalleryEditorRenderer({ queryRef }: Props) {
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
      kind: 'header',
    });

    sections.forEach((section) => {
      items.push({
        kind: 'section',
        section,
        queryRef: query,
      });
    });

    return items;
  }, [sections, query]);

  const scrollContentOffsetY = useSharedValue(0);
  const ref = useAnimatedRef<FlashList<ListItemType>>();

  const renderItem = useCallback<ListRenderItem<ListItemType>>(
    ({ item, index }) => {
      const isLastItem = index === items.length - 1;

      if (item.kind === 'header') {
        return <GalleryEditorHeader />;
      } else if (item.kind === 'section') {
        return (
          <View className={isLastItem ? 'pb-32' : ''}>
            <GalleryEditorSection
              section={item.section}
              queryRef={item.queryRef}
              scrollContentOffsetY={scrollContentOffsetY}
              scrollViewRef={ref}
            />
          </View>
        );
      } else {
        return null;
      }
    },
    [items.length, ref, scrollContentOffsetY]
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
      <GalleryEditorNavbar />
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
