import { useNavigation } from '@react-navigation/native';
import clsx from 'clsx';
import { TouchableOpacity, useWindowDimensions, View } from 'react-native';

import { WhitespaceBlock } from '~/components/Gallery/createVirtualizedCollectionRows';
import { GalleryListItemType } from '~/components/Gallery/createVirtualizedGalleryRows';
import { GalleryTokenPreview } from '~/components/Gallery/GalleryTokenPreview';
import { Markdown } from '~/components/Markdown';
import { Typography } from '~/components/Typography';
import { GalleryTokenPreviewFragment$key } from '~/generated/GalleryTokenPreviewFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import unescape from '~/shared/utils/unescape';

import { sanitizeMarkdown } from '../../utils/sanitizeMarkdown';

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
        <TouchableOpacity onPress={handlePress}>
          <Typography className="text-xl" font={{ family: 'GTAlpina', weight: 'StandardLight' }}>
            {item.name}
          </Typography>
        </TouchableOpacity>

        <Markdown>{item.description}</Markdown>
      </View>
    );
  } else if (item.kind === 'collection-title') {
    const handlePress = () => {
      navigation.push('Collection', { collectionId: item.id });
    };

    return (
      <View className="flex flex-col bg-white dark:bg-black py-2 px-4">
        <TouchableOpacity onPress={handlePress}>
          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            {unescape(item.name ?? '')}
          </Typography>
        </TouchableOpacity>
      </View>
    );
  } else if (item.kind === 'collection-note') {
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
    return <CollectionRow isLast={item.isLast} isFirst={item.isFirst} items={item.items} />;
  }

  return null;
}

function CollectionRow({
  items,
  isFirst,
  isLast,
}: {
  isFirst: boolean;
  isLast: boolean;
  items: Array<WhitespaceBlock | GalleryTokenPreviewFragment$key>;
}) {
  const horizontalRowPadding = 16;
  const inBetweenColumnPadding = 8;

  const screenDimensions = useWindowDimensions();
  const totalSpaceForTokens =
    screenDimensions.width - horizontalRowPadding * 2 - inBetweenColumnPadding * (items.length - 1);

  const widthPerToken = totalSpaceForTokens / items.length;

  return (
    <View
      style={{ paddingHorizontal: horizontalRowPadding }}
      className={clsx('flex w-full flex-row', {
        'pt-4': isFirst, // First row should be space from header
        'pt-2': !isFirst, // All the other rows have a bit of space between them
        'pb-12': isLast, // Last one needs space between itself and the next collection
      })}
    >
      {items.map((subItem, index) => {
        return (
          <View
            key={index}
            style={{
              paddingLeft: index !== 0 ? inBetweenColumnPadding : 0,
            }}
            className={clsx('flex flex-grow items-center justify-center')}
          >
            {'whitespace' in subItem ? (
              <View className="aspect-square h-full" style={{ width: widthPerToken }} />
            ) : (
              <View className="flex items-center justify-center ">
                <GalleryTokenPreview containerWidth={widthPerToken} tokenRef={subItem} />
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
