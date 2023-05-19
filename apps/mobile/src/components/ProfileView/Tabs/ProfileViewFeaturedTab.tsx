import { ListRenderItem } from '@shopify/flash-list';
import { useCallback } from 'react';
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

              # This is so we have the cache prefilled for their full gallery page / collection page
              # eslint-disable-next-line relay/must-colocate-fragment-spreads
              ...GalleryScreenGalleryFragment @defer
            }
          }
        }
      }
    `,
    queryRef
  );

  const user = query.userByUsername;

  if (!user?.featuredGallery) {
    throw new Error('TODO');
  }

  const { items, stickyIndices } = createVirtualizedGalleryRows({
    galleryRef: user.featuredGallery,
  });

  const renderItem = useCallback<ListRenderItem<GalleryListItemType>>(({ item }) => {
    return <GalleryVirtualizedRow item={item} />;
  }, []);

  const contentContainerStyle = useListContentStyle();

  return (
    <View style={contentContainerStyle}>
      <Tabs.FlashList
        estimatedItemSize={300}
        data={items}
        stickyHeaderIndices={stickyIndices}
        renderItem={renderItem}
      />
    </View>
  );
}
