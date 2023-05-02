import { RouteProp, useRoute } from '@react-navigation/native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { useCallback } from 'react';
import { Text, View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';

import {
  createVirtualizedGalleryRows,
  GalleryListItemType,
} from '~/components/Gallery/createVirtualizedGalleryRows';
import { GalleryVirtualizedRow } from '~/components/Gallery/GalleryVirtualizedRow';
import { Markdown } from '~/components/Markdown';
import { GalleryProfileNavBar } from '~/components/ProfileView/GalleryProfileNavBar';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { Typography } from '~/components/Typography';
import { GalleryTokenDimensionCacheProvider } from '~/contexts/GalleryTokenDimensionCacheContext';
import { GalleryScreenQuery } from '~/generated/GalleryScreenQuery.graphql';
import { MainTabStackNavigatorParamList } from '~/navigation/types';

export function GalleryScreen() {
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'Gallery'>>();

  const query = useLazyLoadQuery<GalleryScreenQuery>(
    graphql`
      query GalleryScreenQuery($galleryId: DBID!) {
        galleryById(id: $galleryId) {
          ... on Gallery {
            __typename

            name
            description

            owner {
              username
              ...GalleryProfileNavBarFragment
            }

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

  const { items, stickyIndices } = createVirtualizedGalleryRows({
    galleryRef: gallery,
    noHeader: true,
  });

  const { top } = useSafeAreaPadding();

  const renderItem: ListRenderItem<GalleryListItemType> = useCallback(({ item }) => {
    return <GalleryVirtualizedRow item={item} />;
  }, []);

  return (
    <View className="flex flex-col flex-1 bg-white dark:bg-black" style={{ paddingTop: top }}>
      <View className="px-4 pb-4">
        <GalleryProfileNavBar shouldShowBackButton queryRef={query} userRef={gallery.owner} />
      </View>

      <View className="flex flex-col space-y-1">
        <View className="flex flex-row px-4">
          <Text numberOfLines={1}>
            <Typography
              className="text-metal text-lg"
              font={{ family: 'GTAlpina', weight: 'StandardLight' }}
            >
              {gallery.owner.username}
            </Typography>
            <Typography className="text-lg" font={{ family: 'GTAlpina', weight: 'StandardLight' }}>
              {' '}
              /{' '}
            </Typography>
            <Typography className="text-lg" font={{ family: 'GTAlpina', weight: 'StandardLight' }}>
              {gallery.name || 'Untitled'}
            </Typography>
          </Text>
        </View>

        <Markdown>{gallery.description}</Markdown>
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
