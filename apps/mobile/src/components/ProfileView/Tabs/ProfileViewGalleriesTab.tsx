import { useNavigation } from '@react-navigation/native';
import { ListRenderItem } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { Tabs } from 'react-native-collapsible-tab-view';
import { useFragment } from 'react-relay';
import { graphql, SelectorStoreUpdater } from 'relay-runtime';

import { Button } from '~/components/Button';
import { GalleryPreviewCard } from '~/components/ProfileView/GalleryPreviewCard';
import { useListContentStyle } from '~/components/ProfileView/Tabs/useListContentStyle';
import { useToastActions } from '~/contexts/ToastContext';
import { GalleryPreviewCardFragment$key } from '~/generated/GalleryPreviewCardFragment.graphql';
import { ProfileViewGalleriesTabFragment$key } from '~/generated/ProfileViewGalleriesTabFragment.graphql';
import { useCreateGalleryMutation } from '~/generated/useCreateGalleryMutation.graphql';
import { RootStackNavigatorProp } from '~/navigation/types';
import useCreateGallery from '~/shared/hooks/useCreateGallery';
import { removeNullValues } from '~/shared/relay/removeNullValues';

type ListItem =
  | {
      kind: 'gallery';
      isFeatured: boolean;
      gallery: GalleryPreviewCardFragment$key;
      galleryId: string;
    }
  | {
      kind: 'add-gallery';
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
        ...GalleryPreviewCardQueryFragment
      }
    `,
    queryRef
  );

  const { pushToast } = useToastActions();
  const user = query.userByUsername;
  const createGallery = useCreateGallery();
  const navigation = useNavigation<RootStackNavigatorProp>();

  const handleCreateGallery = useCallback(async () => {
    const latestPosition = query?.userByUsername?.galleries?.length.toString() ?? '0';

    try {
      await createGallery(
        latestPosition,
        (galleryId) => {
          navigation.navigate('NftSelectorGalleryEditor', { galleryId, isNewGallery: true });
        },
        updater
      );
    } catch (error) {
      if (error instanceof Error) {
        pushToast({
          message: 'Unfortunately there was an error to create your gallery',
        });
      }
    }
  }, [createGallery, navigation, pushToast, query?.userByUsername?.galleries?.length]);

  const items = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];

    removeNullValues(user?.galleries).forEach((gallery) => {
      items.push({
        kind: 'gallery',
        gallery,
        galleryId: gallery.dbid,
        isFeatured: user?.featuredGallery?.dbid === gallery.dbid,
      });
    });

    items.push({ kind: 'add-gallery' });

    return items;
  }, [user?.featuredGallery?.dbid, user?.galleries]);

  const renderItem = useCallback<ListRenderItem<ListItem>>(
    ({ item }) => {
      if (item.kind === 'add-gallery') {
        return (
          <View className="px-4 py-5">
            <Button
              onPress={handleCreateGallery}
              eventElementId={null}
              eventName={null}
              eventContext={null}
              text="Add New Gallery"
            />
          </View>
        );
      }

      return (
        <View className="px-4 pb-8">
          <GalleryPreviewCard
            isFeatured={item.isFeatured}
            galleryRef={item.gallery}
            queryRef={query}
          />
        </View>
      );
    },
    [handleCreateGallery, query]
  );

  const contentContainerStyle = useListContentStyle();

  return (
    <View style={contentContainerStyle}>
      <Tabs.FlashList data={items} estimatedItemSize={300} renderItem={renderItem} />
    </View>
  );
}

const updater: SelectorStoreUpdater<useCreateGalleryMutation['response']> = (store, response) => {
  if (response.createGallery?.__typename === 'CreateGalleryPayload') {
    const gallery = response.createGallery.gallery;

    if (gallery) {
      const galleryId = gallery.id;
      const newGallery = store.get(galleryId);

      if (!newGallery) {
        return;
      }

      const userId = response.createGallery.gallery.owner?.id;

      if (!userId) {
        return;
      }

      const user = store.get(userId);

      if (!user) {
        return;
      }

      const galleries = user.getLinkedRecords('galleries');

      if (!galleries) {
        return;
      }

      const newGalleries = [...galleries, newGallery];

      user.setLinkedRecords(newGalleries, 'galleries');
    }
  }
};
