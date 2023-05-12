import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';

import { CollectionRow } from '~/components/Gallery/CollectionVirtualizedRow';
import { GalleryListItemType } from '~/components/Gallery/createVirtualizedGalleryRows';
import { Markdown } from '~/components/Markdown';
import { Typography } from '~/components/Typography';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import unescape from '~/shared/utils/unescape';

import { sanitizeMarkdown } from '../../utils/sanitizeMarkdown';
import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';

type Props = {
  item: GalleryListItemType;
};

export function GalleryVirtualizedRow({ item }: Props) {
  const navigation = useNavigation<MainTabStackNavigatorProp>();

  if (item.kind === 'gallery-header') {
    const handlePress = () => {
      navigation.push('Gallery', { galleryId: item.id });
    };

    return (
      <View className="flex flex-col px-4">
        <GalleryTouchableOpacity onPress={handlePress}>
          <Typography className="text-xl" font={{ family: 'GTAlpina', weight: 'StandardLight' }}>
            {item.name || 'Untitled'}
          </Typography>
        </GalleryTouchableOpacity>

        <Markdown>{item.description}</Markdown>
      </View>
    );
  } else if (item.kind === 'collection-title') {
    const handlePress = () => {
      navigation.push('Collection', { collectionId: item.id });
    };

    return (
      <View className="flex flex-col bg-white dark:bg-black py-2 px-4">
        <GalleryTouchableOpacity onPress={handlePress}>
          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            {unescape(item.name || 'Untitled')}
          </Typography>
        </GalleryTouchableOpacity>
      </View>
    );
  } else if (item.kind === 'collection-note') {
    if (!item.collectorsNote) {
      return null;
    }

    const firstLineOfCollectorsNote = sanitizeMarkdown(item.collectorsNote ?? '');

    return (
      <View className="flex flex-col bg-white dark:bg-black px-4">
        <Typography
          className="text-sm"
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
          numberOfLines={1}
        >
          {firstLineOfCollectorsNote}
        </Typography>
      </View>
    );
  } else if (item.kind === 'collection-row') {
    return (
      <CollectionRow
        columns={item.columns}
        isLast={item.isLast}
        isFirst={item.isFirst}
        items={item.items}
      />
    );
  }

  return null;
}
