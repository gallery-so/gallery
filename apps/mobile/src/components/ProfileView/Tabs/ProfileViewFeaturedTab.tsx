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
  userRef: ProfileViewFeaturedTabFragment$key;
};

export function ProfileViewFeaturedTab({ userRef }: ProfileViewFeaturedTabProps) {
  const user = useFragment(
    graphql`
      fragment ProfileViewFeaturedTabFragment on GalleryUser {
        __typename

        featuredGallery {
          ...createVirtualizedGalleryRows

          # This is so we have the cache prefilled for their full gallery page / collection page
          # eslint-disable-next-line relay/must-colocate-fragment-spreads
          ...GalleryScreenGalleryFragment @defer
        }
      }
    `,
    userRef
  );

  if (!user.featuredGallery) {
    throw new Error('Yikes');
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