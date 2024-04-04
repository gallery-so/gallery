import { GestureResponderEvent, View } from 'react-native';
import { DragIcon } from 'src/icons/DragIcon';
import { MinusCircleIcon } from 'src/icons/MinusCircleIcon';
import { PlusCircleIcon } from 'src/icons/PlusCircleIcon';

import { useGalleryEditorActions } from '~/contexts/GalleryEditor/GalleryEditorContext';
import { StagedRow } from '~/contexts/GalleryEditor/types';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { BaseM } from '../Text';

type Props = {
  row: StagedRow;
};

export function GalleryEditorActiveActions({ row }: Props) {
  const { incrementColumns, decrementColumns } = useGalleryEditorActions();

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
            onPress={(e: GestureResponderEvent) => {
              e.stopPropagation();
              decrementColumns(row.id);
            }}
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
            onPress={(e: GestureResponderEvent) => {
              e.stopPropagation();
              incrementColumns(row.id);
            }}
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
