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
  const { activeRowId, sections, sectionIdBeingEdited, saveGallery } = useGalleryEditorActions();

  const { showBottomSheetModal } = useBottomSheetModalActions();

  const handleDebugger = useCallback(() => {
    showBottomSheetModal({
      content: (
        <DebuggerBottomSheet
          activeSectionId={sectionIdBeingEdited}
          activeRowId={activeRowId}
          sections={sections}
        />
      ),
    });
  }, [activeRowId, sections, sectionIdBeingEdited, showBottomSheetModal]);

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
  sections: StagedSectionList;
};

function DebuggerBottomSheet({ activeRowId, activeSectionId, sections }: DebuggerBottomSheetProps) {
  // console.log(collections);
  return (
    <View className="gap-2">
      <View className="gap-2">
        {sections.map((section) => {
          return (
            <View key={section.dbid}>
              <BaseM
                classNameOverride={clsx(
                  section.dbid === activeSectionId ? 'text-activeBlue' : null
                )}
              >
                {section.name || 'Empty'} -
                <BaseM classNameOverride="text-gray-500">{section.dbid}</BaseM>
              </BaseM>
              {section.rows.map((row, index) => {
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
