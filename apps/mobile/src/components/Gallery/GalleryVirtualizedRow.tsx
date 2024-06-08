import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { CollectionRow } from '~/components/Gallery/CollectionVirtualizedRow';
import { GalleryListItemType } from '~/components/Gallery/createVirtualizedGalleryRows';
import { Markdown } from '~/components/Markdown';
import { Typography } from '~/components/Typography';
import { GalleryVirtualizedRowQueryFragment$key } from '~/generated/GalleryVirtualizedRowQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';

type Props = {
  queryRef: GalleryVirtualizedRowQueryFragment$key;
  item: GalleryListItemType;
  isOnCollectionScreen?: boolean;
};

export function GalleryVirtualizedRow({ queryRef, item, isOnCollectionScreen }: Props) {
  const query = useFragment(
    graphql`
      fragment GalleryVirtualizedRowQueryFragment on Query {
        ...CollectionVirtualizedRowQueryFragment
      }
    `,
    queryRef
  );
  const navigation = useNavigation<MainTabStackNavigatorProp>();

  if (item.kind === 'gallery-header') {
    const handlePress = () => {
      navigation.push('Gallery', { galleryId: item.id });
    };

    return (
      <View className="flex flex-col px-4">
        <GalleryTouchableOpacity
          onPress={handlePress}
          eventElementId="Gallery Element"
          eventName="Gallery Element Clicked"
          eventContext={contexts.UserGallery}
          properties={{ variant: 'gallery title' }}
        >
          <Typography className="text-xl" font={{ family: 'GTAlpina', weight: 'StandardLight' }}>
            {item.name || 'Untitled'}
          </Typography>
        </GalleryTouchableOpacity>

        <Markdown>{item.description}</Markdown>
      </View>
    );
  } else if (item.kind === 'collection-title' && item.name) {
    const handlePress = () => {
      if (isOnCollectionScreen) return;
      navigation.push('Collection', { collectionId: item.id });
    };

    return (
      <View className="flex flex-col bg-white dark:bg-black-900 pt-2 pb-1 px-4">
        <GalleryTouchableOpacity
          onPress={handlePress}
          eventElementId="Gallery Element"
          eventName="Gallery Element Clicked"
          eventContext={contexts.UserGallery}
          properties={{ variant: 'collection title' }}
        >
          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            {item.name || 'Untitled'}
          </Typography>
        </GalleryTouchableOpacity>
      </View>
    );
  } else if (item.kind === 'collection-note') {
    if (!item.collectorsNote) {
      return null;
    }

    return (
      <View className="flex flex-col bg-white dark:bg-black-900 px-4">
        <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
          <Markdown>{item.collectorsNote}</Markdown>
        </Typography>
      </View>
    );
  } else if (item.kind === 'collection-row') {
    return (
      <CollectionRow
        queryRef={query}
        columns={item.columns}
        isLast={item.isLast}
        isFirst={item.isFirst}
        items={item.items}
      />
    );
  }

  return null;
}
