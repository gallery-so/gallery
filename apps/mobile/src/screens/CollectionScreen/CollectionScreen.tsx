import { RouteProp, useRoute } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { Suspense, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';

import {
  CollectionListItemType,
  createVirtualizedCollectionRows,
} from '~/components/Gallery/createVirtualizedCollectionRows';
import { GalleryNameHeader } from '~/components/Gallery/GalleryNameHeader';
import { GalleryVirtualizedRow } from '~/components/Gallery/GalleryVirtualizedRow';
import { Markdown } from '~/components/Markdown';
import { GalleryProfileNavBar } from '~/components/ProfileView/GalleryProfileNavBar';
import { CollectionScreenQuery } from '~/generated/CollectionScreenQuery.graphql';
import { MainTabStackNavigatorParamList } from '~/navigation/types';
import { CollectionScreenFallback } from '~/screens/CollectionScreen/CollectionScreenFallback';

type ListItem = CollectionListItemType | { kind: 'description'; description: string; key: string };

function CollectionScreenInner() {
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'Collection'>>();

  const query = useLazyLoadQuery<CollectionScreenQuery>(
    graphql`
      query CollectionScreenQuery($collectionId: DBID!) {
        collectionById(id: $collectionId) {
          ... on Collection {
            __typename

            gallery {
              owner {
                ...GalleryProfileNavBarFragment
              }

              ...GalleryNameHeaderFragment
            }

            ...createVirtualizedCollectionRows
          }
        }

        ...GalleryProfileNavBarQueryFragment
      }
    `,
    { collectionId: route.params.collectionId }
  );

  const collection = query.collectionById;
  if (collection?.__typename !== 'Collection') {
    throw new Error(
      `Expected collection to have typename \`Collection\`, but received ${collection?.__typename}`
    );
  }

  if (!collection.gallery?.owner) {
    throw new Error('Expected collection to have an owner, received null instead');
  }

  const { items, stickyIndices } = useMemo(() => {
    return createVirtualizedCollectionRows({ collectionRef: collection });
  }, [collection]);

  const renderItem: ListRenderItem<ListItem> = useCallback(({ item }) => {
    if (item.kind === 'description') {
      return <Markdown>{item.description}</Markdown>;
    } else {
      return <GalleryVirtualizedRow item={item} isOnCollectionScreen />;
    }
  }, []);

  return (
    <View className="flex flex-col flex-1 bg-white dark:bg-black-900 pt-4">
      <View className="px-4 pb-4">
        <GalleryProfileNavBar
          shouldShowBackButton
          queryRef={query}
          userRef={collection.gallery.owner}
          screen="Collection"
        />
      </View>

      <View className="flex flex-col space-y-1 pb-2">
        <View className="px-4">
          <GalleryNameHeader isOnGalleryScreen={false} galleryRef={collection.gallery} />
        </View>
      </View>

      <View className="flex-grow">
        <FlashList
          data={items}
          estimatedItemSize={300}
          renderItem={renderItem}
          stickyHeaderIndices={stickyIndices}
        />
      </View>
    </View>
  );
}

export function CollectionScreen() {
  return (
    <Suspense fallback={<CollectionScreenFallback />}>
      <CollectionScreenInner />
    </Suspense>
  );
}
