import clsx from 'clsx';
import { useCallback } from 'react';
import { View } from 'react-native';

import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { useGalleryEditorActions } from '~/contexts/GalleryEditor/GalleryEditorContext';
import { StagedSectionList } from '~/contexts/GalleryEditor/types';

import { BackButton } from '../BackButton';
import { Button } from '../Button';
import { BaseM } from '../Text';

export function GalleryEditorNavbar() {
  const { activeRowId, collections, sectionIdBeingEdited, saveGallery } = useGalleryEditorActions();

  const { showBottomSheetModal } = useBottomSheetModalActions();

  const handleDebugger = useCallback(() => {
    showBottomSheetModal({
      content: (
        <DebuggerBottomSheet
          activeSectionId={sectionIdBeingEdited}
          activeRowId={activeRowId}
          collections={collections}
        />
      ),
    });
  }, [activeRowId, collections, sectionIdBeingEdited, showBottomSheetModal]);

  return (
    <View className="p-4 flex-row items-center justify-between">
      <BackButton />

      <View className="flex-row gap-2">
        <Button
          onPress={handleDebugger}
          text="Debugger"
          eventElementId={null}
          eventName={null}
          eventContext={null}
          size="xs"
          fontWeight="Bold"
          variant="secondary"
        />
        <Button
          onPress={saveGallery}
          text="Publish"
          eventElementId={null}
          eventName={null}
          eventContext={null}
          size="xs"
          fontWeight="Bold"
        />
      </View>
    </View>
  );
}

type DebuggerBottomSheetProps = {
  activeSectionId: string | null;
  activeRowId: string | null;
  collections: StagedSectionList;
};

function DebuggerBottomSheet({
  activeRowId,
  activeSectionId,
  collections,
}: DebuggerBottomSheetProps) {
  // console.log(collections);
  return (
    <View className="gap-2">
      <View className="gap-2">
        {collections.map((collection) => {
          return (
            <View key={collection.dbid}>
              <BaseM
                classNameOverride={clsx(
                  collection.dbid === activeSectionId ? 'text-activeBlue' : null
                )}
              >
                {collection.name || 'Empty'} -
                <BaseM classNameOverride="text-gray-500">{collection.dbid}</BaseM>
              </BaseM>
              {collection.rows.map((row, index) => {
                return (
                  <View key={row.id}>
                    <BaseM
                      classNameOverride={clsx(row.id === activeRowId ? 'text-activeBlue' : null)}
                    >
                      {index + 1}. {row.id} - columns ({row.columns})
                    </BaseM>
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>
    </View>
  );
}
