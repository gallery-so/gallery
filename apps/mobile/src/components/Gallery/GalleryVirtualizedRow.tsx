import clsx from 'clsx';
import { useWindowDimensions, View } from 'react-native';

import {
  GalleryListItemType,
  WhitespaceBlock,
} from '~/components/Gallery/createVirtualizedGalleryRows';
import { GalleryTokenPreview } from '~/components/Gallery/GalleryTokenPreview';
import { Markdown } from '~/components/Markdown';
import { Typography } from '~/components/Typography';
import { GalleryTokenPreviewFragment$key } from '~/generated/GalleryTokenPreviewFragment.graphql';

type Props = {
  item: GalleryListItemType;
};

export function GalleryVirtualizedRow({ item }: Props) {
  if (item.kind === 'gallery-header') {
    return (
      <View className="flex flex-col px-4">
        <Typography className="text-xl" font={{ family: 'GTAlpina', weight: 'Light' }}>
          {item.name}
        </Typography>

        <Markdown>{item.description}</Markdown>
      </View>
    );
  } else if (item.kind === 'collection-title') {
    return (
      <View className="flex flex-col bg-white py-2 px-4">
        <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          {item.name}
        </Typography>
      </View>
    );
  } else if (item.kind === 'collection-note') {
    const firstLineOfCollectorsNote = item.collectorsNote?.split('\n')?.[0];

    return (
      <View className="flex flex-col bg-white px-4">
        <Markdown numberOfLines={1}>{firstLineOfCollectorsNote}</Markdown>
      </View>
    );
  } else if (item.kind === 'collection-row') {
    return (
      <CollectionRow
        // Normally it is not performant to use a key in a FlashList
        // But we have to do this to ensure the state for the token's image dimensions
        // are reset.
        // By default, FlashList will reuse component instances, so the state doesn't get reset
        key={item.key}
        isLast={item.isLast}
        isFirst={item.isFirst}
        items={item.items}
      />
    );
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
            className={clsx('flex flex-grow')}
          >
            {'whitespace' in subItem ? (
              <View className="h-full bg-gray-400" />
            ) : (
              <View className="flex flex-grow items-center justify-center">
                <GalleryTokenPreview containerWidth={widthPerToken} tokenRef={subItem} />
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
