import { ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { Tabs } from 'react-native-collapsible-tab-view';
import { graphql, usePaginationFragment } from 'react-relay';
import { removeNullValues } from 'shared/relay/removeNullValues';
import { GALLERIES_PER_PAGE } from 'src/constants/community';

import { useListContentStyle } from '~/components/ProfileView/Tabs/useListContentStyle';
import { Typography } from '~/components/Typography';
import { CommunityGalleriesFragment$key } from '~/generated/CommunityGalleriesFragment.graphql';
import { CommunityGalleriesRowFragment$key } from '~/generated/CommunityGalleriesRowFragment.graphql';

import { CommunityGalleriesRow } from './CommunityGalleriesRow';

type Props = {
  communityRef: CommunityGalleriesFragment$key;
};

type GalleryItemList =
  | {
      kind: 'galleries-section-header';
    }
  | {
      kind: 'galleries-row-item';
      galleryRefs: CommunityGalleriesRowFragment$key;
    };

export function CommunityGalleries({ communityRef }: Props) {
  const {
    data: community,
    loadNext,
    hasNext,
    isLoadingNext,
  } = usePaginationFragment(
    graphql`
      fragment CommunityGalleriesFragment on Community
      @refetchable(queryName: "CommunityGalleriesRefetchableFragment") {
        galleries(first: $galleriesFirst, after: $galleriesAfter, maxPreviews: 2)
          @connection(key: "CommunityGalleriesList_galleries") {
          edges {
            node {
              __typename
              ...CommunityGalleriesRowFragment
            }
          }
        }
      }
    `,
    communityRef
  );

  const nonNullGalleries = useMemo(() => {
    return removeNullValues(community?.galleries?.edges?.map((edge) => edge?.node));
  }, [community?.galleries?.edges]);

  const items = useMemo(() => {
    const items: GalleryItemList[] = [];

    items.push({
      kind: 'galleries-section-header',
    });

    for (let i = 0; i < nonNullGalleries.length; i += 2) {
      const galleryRefs: CommunityGalleriesRowFragment$key = removeNullValues([
        nonNullGalleries[i],
        nonNullGalleries[i + 1],
      ]);

      if (galleryRefs.every((ref) => ref !== undefined)) {
        items.push({
          kind: 'galleries-row-item',
          galleryRefs,
        });
      }
    }

    return items;
  }, [nonNullGalleries]);

  const renderItem = useCallback<ListRenderItem<GalleryItemList>>(({ item }) => {
    switch (item.kind) {
      case 'galleries-section-header':
        return (
          <View className="px-4 py-3">
            <Typography font={{ family: 'ABCDiatype', weight: 'Bold' }} className="text-sm">
              Galleries
            </Typography>
          </View>
        );
      case 'galleries-row-item':
        return <CommunityGalleriesRow galleryRefs={item.galleryRefs} />;
    }
  }, []);

  const loadMore = useCallback(() => {
    if (hasNext) {
      loadNext(GALLERIES_PER_PAGE);
    }
  }, [hasNext, loadNext]);

  const contentContainerStyle = useListContentStyle();

  return (
    <View
      style={{
        ...contentContainerStyle,
        paddingTop: 0,
      }}
    >
      <Tabs.FlashList
        data={items}
        estimatedItemSize={162}
        renderItem={renderItem}
        onEndReached={loadMore}
        refreshing={isLoadingNext}
        onEndReachedThreshold={0.8}
      />
    </View>
  );
}
