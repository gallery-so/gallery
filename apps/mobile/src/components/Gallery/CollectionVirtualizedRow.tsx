import clsx from 'clsx';
import { useWindowDimensions, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { WhitespaceBlock } from '~/components/Gallery/createVirtualizedCollectionRows';
import { GalleryTokenPreview } from '~/components/Gallery/GalleryTokenPreview';
import { CollectionVirtualizedRowQueryFragment$key } from '~/generated/CollectionVirtualizedRowQueryFragment.graphql';
import { GalleryTokenPreviewFragment$key } from '~/generated/GalleryTokenPreviewFragment.graphql';

type CollectionRowProps = {
  queryRef: CollectionVirtualizedRowQueryFragment$key;
  isFirst: boolean;
  isLast: boolean;
  columns: number;
  items: Array<WhitespaceBlock | GalleryTokenPreviewFragment$key>;
};

export function CollectionRow({ queryRef, columns, items, isFirst, isLast }: CollectionRowProps) {
  const query = useFragment(
    graphql`
      fragment CollectionVirtualizedRowQueryFragment on Query {
        ...GalleryTokenPreviewQueryFragment
      }
    `,
    queryRef
  );
  const horizontalRowPadding = 16;
  const inBetweenColumnPadding = 8;

  const screenDimensions = useWindowDimensions();
  const totalSpaceForTokens =
    screenDimensions.width - horizontalRowPadding * 2 - inBetweenColumnPadding * (columns - 1);

  const widthPerToken = totalSpaceForTokens / columns;

  return (
    <View
      style={{ paddingHorizontal: horizontalRowPadding }}
      className={clsx('flex w-full flex-row', {
        'pt-4': isFirst, // First row should be space from header
        'pt-2': !isFirst, // All the other rows have a bit of space between them
        'pb-12': isLast, // Last one needs space between itself and the next collection
      })}
    >
      {Array.from({ length: columns }).map((_, index) => {
        const item = items[index] ?? { whitespace: 'whitespace' };

        return (
          <View
            key={index}
            style={{
              paddingLeft: index !== 0 ? inBetweenColumnPadding : 0,
            }}
            className={clsx('flex flex-grow items-center justify-center')}
          >
            {'whitespace' in item ? (
              <View className="aspect-square w-full" style={{ width: widthPerToken }} />
            ) : (
              <View className="flex items-center justify-center ">
                <GalleryTokenPreview
                  queryRef={query}
                  containerWidth={widthPerToken}
                  tokenRef={item}
                />
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
