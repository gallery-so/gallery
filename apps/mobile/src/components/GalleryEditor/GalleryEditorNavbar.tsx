import { useNavigation } from '@react-navigation/native';
import clsx from 'clsx';
import { useCallback } from 'react';
import { View } from 'react-native';

import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { useGalleryEditorActions } from '~/contexts/GalleryEditor/GalleryEditorContext';
import { StagedSectionList } from '~/contexts/GalleryEditor/types';
import { RootStackNavigatorProp } from '~/navigation/types';

import { BackButton } from '../BackButton';
import { Button } from '../Button';
import { BaseM } from '../Text';

export function GalleryEditorNavbar() {
  const { activeRowId, galleryId, sections, sectionIdBeingEdited, saveGallery } =
    useGalleryEditorActions();
  const navigation = useNavigation<RootStackNavigatorProp>();

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

  const handlePublishGallery = useCallback(async () => {
    await saveGallery();

    navigation.navigate('PublishGallery', {
      galleryId,
    });
  }, [galleryId, navigation, saveGallery]);

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
          onPress={handlePublishGallery}
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
              <View className="gap-2">
                {section.rows.map((row, index) => {
                  return (
                    <View key={row.id}>
                      <BaseM
                        classNameOverride={clsx(
                          'mb-1',
                          row.id === activeRowId ? 'text-activeBlue' : null
                        )}
                      >
                        {index + 1}. {row.id} - columns ({row.columns})
                      </BaseM>
                      <View className="gap-1">
                        {row.items.map((item) => {
                          return (
                            <BaseM
                              key={item.id}
                              classNameOverride="text-xs font-mono text-gray-600"
                            >
                              {item.id}
                            </BaseM>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
