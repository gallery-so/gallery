import { useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { removeNullValues } from 'shared/relay/removeNullValues';
import { parseCollectionLayout } from 'shared/utils/collectionLayout';

import { GalleryEditorTokenPreview } from '~/components/GalleryEditor/GalleryEditorTokenPreview';
import { WhiteSpace } from '~/components/GalleryEditor/SortableTokenGrid/SortableTokenGrid';
import { Typography } from '~/components/Typography';
import { PublishGalleryPreviewFragment$key } from '~/generated/PublishGalleryPreviewFragment.graphql';

type Props = {
  galleryRef: PublishGalleryPreviewFragment$key;
};

const CONTAINER_WIDTH = 300;

export function PublishGalleryPreview({ galleryRef }: Props) {
  const gallery = useFragment(
    graphql`
      fragment PublishGalleryPreviewFragment on Gallery {
        id
        name

        collections {
          name
          collectorsNote
          layout {
            __typename
            sections
            sectionLayout {
              columns
              whitespace
            }
            ...collectionLayoutParseFragment
          }
          tokens {
            id
            token {
              ...GalleryEditorTokenPreviewFragment
            }
          }
        }
      }
    `,
    galleryRef
  );

  // get first section in the gallery
  const firstSection = gallery.collections?.[0];

  const nonNullTokens = useMemo(() => {
    return removeNullValues(firstSection?.tokens);
  }, [firstSection?.tokens]);

  const rows = useMemo(() => {
    const layout = firstSection?.layout || {
      __typename: 'CollectionLayout',
      sections: [],
      sectionLayout: [],
    };

    return parseCollectionLayout(
      nonNullTokens,
      {
        ...layout,
        sections: removeNullValues(layout.sections ?? []),
        sectionLayout: removeNullValues(layout.sectionLayout ?? []),
      },
      true
    );
  }, [nonNullTokens, firstSection?.layout]);

  if (!gallery) {
    return null;
  }

  return (
    <View
      className="bg-offWhite dark:bg-black-800 border border-porcelain flex w-full flex-col space-y-3 rounded-xl px-4 pt-4"
      style={{
        shadowColor: 'rgb(0, 0, 0)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      }}
    >
      <View className="flex flex-row items-center justify-center">
        <View className="flex flex-1 flex-col">
          <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            {firstSection?.name || 'Untitled'}
          </Typography>
          <Typography
            numberOfLines={1}
            className="text-xs"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            {firstSection?.collectorsNote}
          </Typography>
        </View>
      </View>
      <View>
        <View className="flex-row flex-wrap gap-2 max-h-64 overflow-hidden">
          {rows.map((row) => {
            // 64 is the padding on the left and right of the container
            const widthPerToken = (CONTAINER_WIDTH - 64 - 16) / row.columns;

            return (
              <View key={row.id} className="flex-row flex-wrap gap-2">
                {row.items.map((item) => {
                  if ('whitespace' in item) {
                    return <WhiteSpace key={item.id} size={widthPerToken} />;
                  } else {
                    return (
                      <View
                        key={item.id}
                        className="aspect-square"
                        style={{
                          width: widthPerToken,
                        }}
                      >
                        {item.token && <GalleryEditorTokenPreview tokenRef={item.token} />}
                      </View>
                    );
                  }
                })}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
