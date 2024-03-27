import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { Tabs } from 'react-native-collapsible-tab-view';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { Button } from '~/components/Button';
import { GalleryPreviewCard } from '~/components/ProfileView/GalleryPreviewCard';
import { useListContentStyle } from '~/components/ProfileView/Tabs/useListContentStyle';
import { GalleryPreviewCardFragment$key } from '~/generated/GalleryPreviewCardFragment.graphql';
import { ProfileViewGalleriesTabFragment$key } from '~/generated/ProfileViewGalleriesTabFragment.graphql';
import { RootStackNavigatorParamList } from '~/navigation/types';
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

  const navigation = useNavigation<NativeStackNavigationProp<RootStackNavigatorParamList>>();

  const handleEditGallery = useCallback(
    (galleryId: string) => {
      navigation.navigate('GalleryEditor', {
        galleryId,
      });
    },
    [navigation]
  );

  const renderItem = useCallback<ListRenderItem<ListItem>>(
    ({ item }) => {
      return (
        <View className="px-4 pb-8">
          <Button
            className="mb-4"
            text="edit Gallery"
            eventElementId={null}
            eventName={null}
            eventContext={null}
            onPress={() => handleEditGallery(item.galleryId)}
          />
          <GalleryPreviewCard isFeatured={item.isFeatured} galleryRef={item.gallery} />
        </View>
      );
    },
    [handleEditGallery]
  );

  const contentContainerStyle = useListContentStyle();

  return (
    <View style={contentContainerStyle}>
      <Tabs.FlashList data={items} estimatedItemSize={300} renderItem={renderItem} />
    </View>
  );
}
