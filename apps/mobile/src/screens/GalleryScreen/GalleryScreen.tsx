import { RouteProp, useRoute } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { Suspense, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';

import {
  createVirtualizedGalleryRows,
  GalleryListItemType,
} from '~/components/Gallery/createVirtualizedGalleryRows';
import { GalleryNameHeader } from '~/components/Gallery/GalleryNameHeader';
import { GalleryVirtualizedRow } from '~/components/Gallery/GalleryVirtualizedRow';
import { Markdown } from '~/components/Markdown';
import { GalleryProfileNavBar } from '~/components/ProfileView/GalleryProfileNavBar';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { GalleryTokenDimensionCacheProvider } from '~/contexts/GalleryTokenDimensionCacheContext';
import { GalleryScreenQuery } from '~/generated/GalleryScreenQuery.graphql';
import { MainTabStackNavigatorParamList } from '~/navigation/types';
import { GalleryScreenFallback } from '~/screens/GalleryScreen/GalleryScreenFallback';

type ListItem = GalleryListItemType | { kind: 'description'; description: string; key: string };

function GalleryScreenInner() {
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'Gallery'>>();

  const query = useLazyLoadQuery<GalleryScreenQuery>(
    graphql`
      query GalleryScreenQuery($galleryId: DBID!) {
        galleryById(id: $galleryId) {
          ... on Gallery {
            __typename

            description

            owner {
              ...GalleryProfileNavBarFragment
            }

            ...GalleryNameHeaderFragment
            ...createVirtualizedGalleryRows
          }
        }

        ...GalleryProfileNavBarQueryFragment
      }
    `,
    { galleryId: route.params.galleryId }
  );

  const gallery = query.galleryById;
  if (gallery?.__typename !== 'Gallery' || !gallery.owner) {
    throw new Error('');
  }

  const { items, stickyIndices } = useMemo(() => {
    const galleryRows = createVirtualizedGalleryRows({
      galleryRef: gallery,
      noHeader: true,
    });

    const items: ListItem[] = [];

    if (gallery.description) {
      items.push({ key: 'description', kind: 'description', description: gallery.description });
    }

    const stickyIndices: number[] = [];

    const offset = items.length;
    items.push(...galleryRows.items);
    stickyIndices.push(...galleryRows.stickyIndices.map((index) => index + offset));

    return { items, stickyIndices };
  }, [gallery]);

  const renderItem: ListRenderItem<ListItem> = useCallback(({ item }) => {
    if (item.kind === 'description') {
      return <Markdown>{item.description}</Markdown>;
    } else {
      return <GalleryVirtualizedRow item={item} />;
    }
  }, []);

  const { top } = useSafeAreaPadding();

  return (
    <View className="flex flex-col flex-1 bg-white dark:bg-black" style={{ paddingTop: top }}>
      <View className="px-4 pb-2">
        <GalleryProfileNavBar shouldShowBackButton queryRef={query} userRef={gallery.owner} />
      </View>

      <View className="flex flex-col space-y-1 pb-2">
        <View className="px-4">
          <GalleryNameHeader galleryRef={gallery} />
        </View>
      </View>

      <View className="flex-grow">
        <GalleryTokenDimensionCacheProvider>
          <FlashList
            data={items}
            estimatedItemSize={300}
            renderItem={renderItem}
            stickyHeaderIndices={stickyIndices}
          />
        </GalleryTokenDimensionCacheProvider>
      </View>
    </View>
  );
}

export function GalleryScreen() {
  return (
    <Suspense fallback={<GalleryScreenFallback />}>
      <GalleryScreenInner />
    </Suspense>
  );
}
