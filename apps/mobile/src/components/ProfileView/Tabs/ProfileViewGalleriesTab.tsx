import { ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { Tabs } from 'react-native-collapsible-tab-view';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { GalleryPreviewCard } from '~/components/ProfileView/GalleryPreviewCard';
import { useListContentStyle } from '~/components/ProfileView/Tabs/useListContentStyle';
import { GalleryPreviewCardFragment$key } from '~/generated/GalleryPreviewCardFragment.graphql';
import { ProfileViewGalleriesTabFragment$key } from '~/generated/ProfileViewGalleriesTabFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

type ListItem = {
  kind: 'gallery';
  isFeatured: boolean;
  gallery: GalleryPreviewCardFragment$key;
  galleryId: string;
};

type ProfileViewGalleriesTabProps = {
  queryRef: ProfileViewGalleriesTabFragment$key;
};

export function ProfileViewGalleriesTab({ queryRef }: ProfileViewGalleriesTabProps) {
  const query = useFragment(
    graphql`
      fragment ProfileViewGalleriesTabFragment on Query {
        userByUsername(username: $username) {
          ... on GalleryUser {
            featuredGallery {
              dbid
            }

            galleries {
              dbid

              ...GalleryPreviewCardFragment
            }
          }
        }
      }
    `,
    queryRef
  );

  const user = query.userByUsername;

  const items = useMemo<ListItem[]>(() => {
    return removeNullValues(user?.galleries).map((gallery): ListItem => {
      return {
        kind: 'gallery',

        gallery,
        galleryId: gallery.dbid,
        isFeatured: user?.featuredGallery?.dbid === gallery.dbid,
      };
    });
  }, [user?.featuredGallery?.dbid, user?.galleries]);

  const renderItem = useCallback<ListRenderItem<ListItem>>(({ item }) => {
    return (
      <View className="px-4 pb-8">
        <GalleryPreviewCard isFeatured={item.isFeatured} galleryRef={item.gallery} />
      </View>
    );
  }, []);

  const contentContainerStyle = useListContentStyle();

  return (
    <View style={contentContainerStyle}>
      <Tabs.FlashList data={items} estimatedItemSize={300} renderItem={renderItem} />
    </View>
  );
}
