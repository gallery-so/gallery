import { ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { Tabs } from 'react-native-collapsible-tab-view';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import {
  createVirtualizedGalleryRows,
  GalleryListItemType,
} from '~/components/Gallery/createVirtualizedGalleryRows';
import { GalleryVirtualizedRow } from '~/components/Gallery/GalleryVirtualizedRow';
import { useListContentStyle } from '~/components/ProfileView/Tabs/useListContentStyle';
import { ProfileViewFeaturedTabFragment$key } from '~/generated/ProfileViewFeaturedTabFragment.graphql';

type ProfileViewFeaturedTabProps = {
  queryRef: ProfileViewFeaturedTabFragment$key;
};

export function ProfileViewFeaturedTab({ queryRef }: ProfileViewFeaturedTabProps) {
  const query = useFragment(
    graphql`
      fragment ProfileViewFeaturedTabFragment on Query {
        userByUsername(username: $username) {
          ... on GalleryUser {
            featuredGallery {
              ...createVirtualizedGalleryRows
            }
          }
        }
        ...GalleryVirtualizedRowQueryFragment
      }
    `,
    queryRef
  );

  const user = query.userByUsername;

  const { items, stickyIndices } = useMemo(() => {
    if (!user?.featuredGallery) {
      return { items: [], stickyIndices: [] };
    }

    return createVirtualizedGalleryRows({
      galleryRef: user.featuredGallery,
    });
  }, [user?.featuredGallery]);

  const renderItem = useCallback<ListRenderItem<GalleryListItemType>>(
    ({ item }) => {
      return <GalleryVirtualizedRow queryRef={query} item={item} />;
    },
    [query]
  );

  const contentContainerStyle = useListContentStyle();

  return (
    <View style={contentContainerStyle}>
      <Tabs.FlashList
        getItemType={(item) => item.kind}
        keyExtractor={(item) => item.key}
        estimatedItemSize={100}
        data={items}
        stickyHeaderIndices={stickyIndices}
        renderItem={renderItem}
      />
    </View>
  );
}
