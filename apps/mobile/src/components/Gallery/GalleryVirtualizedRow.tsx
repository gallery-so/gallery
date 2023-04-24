import { View } from 'react-native';

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
      <View className="flex flex-col bg-white">
        <Markdown numberOfLines={1}>{firstLineOfCollectorsNote}</Markdown>
      </View>
    );
  } else if (item.kind === 'collection-row') {
    return <CollectionRow items={item.items} />;
  }

  return null;
}

function CollectionRow({
  items,
}: {
  items: Array<WhitespaceBlock | GalleryTokenPreviewFragment$key>;
}) {
  return (
    <View className="mb-12 flex w-full flex-row space-x-2 px-4 py-1">
      {items.map((subItem, index) => {
        return (
          <View key={index} className="flex flex-grow">
            {'whitespace' in subItem ? (
              <View className="h-full bg-gray-400" />
            ) : (
              <View className="flex flex-grow items-center justify-center">
                <GalleryTokenPreview tokenRef={subItem} />
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
