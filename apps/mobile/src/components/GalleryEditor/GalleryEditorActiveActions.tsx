import { useCallback } from 'react';
import { GestureResponderEvent, View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { DragIcon } from 'src/icons/DragIcon';
import { MinusCircleIcon } from 'src/icons/MinusCircleIcon';
import { PlusCircleIcon } from 'src/icons/PlusCircleIcon';

import { useGalleryEditorActions } from '~/contexts/GalleryEditor/GalleryEditorContext';
import { StagedRow } from '~/contexts/GalleryEditor/types';
import { GalleryEditorActiveActionsFragment$key } from '~/generated/GalleryEditorActiveActionsFragment.graphql';
import useMaxColumnsGalleryEditor from '~/shared/hooks/useMaxColumnsGalleryEditor';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { BaseM } from '../Text';

type Props = {
  row: StagedRow;
  queryRef: GalleryEditorActiveActionsFragment$key;
};

export function GalleryEditorActiveActions({ row, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment GalleryEditorActiveActionsFragment on Query {
        viewer {
          __typename
          ...useMaxColumnsGalleryEditorFragment
        }
      }
    `,
    queryRef
  );

  if (query.viewer?.__typename !== 'Viewer') {
    throw new Error('Expected viewer to be present');
  }

  const { incrementColumns, decrementColumns } = useGalleryEditorActions();

  const maxColumns = useMaxColumnsGalleryEditor(query.viewer);

  const handleIncrementPress = useCallback(
    (e: GestureResponderEvent) => {
      e.stopPropagation();

      if (row.columns < maxColumns) {
        incrementColumns(row.id);
      }
    },
    [row.columns, row.id, incrementColumns, maxColumns]
  );

  const handleDecrementPress = useCallback(
    (e: GestureResponderEvent) => {
      e.stopPropagation();
      if (row.columns > 1) {
        decrementColumns(row.id);
      }
    },
    [row.columns, row.id, decrementColumns]
  );

  return (
    <View className="absolute right-0 top-0 flex-row gap-1 z-10">
      <View className="rounded-sm bg-activeBlue px-1 py-0.5 flex-row space-x-1 items-center">
        <BaseM classNameOverride="text-xs text-offWhite leading-1" weight="Bold">
          Columns
        </BaseM>

        <View className="flex-row items-center space-x-1.5">
          <GalleryTouchableOpacity
            eventElementId={null}
            eventName={null}
            eventContext={null}
            onPress={handleDecrementPress}
          >
            <MinusCircleIcon />
          </GalleryTouchableOpacity>

          <BaseM classNameOverride="text-xs text-offWhite leading-1" weight="Bold">
            {row.columns}
          </BaseM>
          <GalleryTouchableOpacity
            eventElementId={null}
            eventName={null}
            eventContext={null}
            onPress={handleIncrementPress}
          >
            <PlusCircleIcon />
          </GalleryTouchableOpacity>
        </View>
      </View>
      <View className="h-6 w-7 rounded-sm bg-activeBlue px-1 py-0.5">
        <DragIcon />
      </View>
    </View>
  );
}
