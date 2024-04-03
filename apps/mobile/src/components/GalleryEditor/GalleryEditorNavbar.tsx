import { useCallback } from 'react';
import { View } from 'react-native';

import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { useGalleryEditorActions } from '~/contexts/GalleryEditor/GalleryEditorContext';

import { BackButton } from '../BackButton';
import { Button } from '../Button';
import { BaseM } from '../Text';

export function GalleryEditorNavbar() {
  const { activeSectionId, collectionIdBeingEdited, saveGallery } = useGalleryEditorActions();

  const { showBottomSheetModal } = useBottomSheetModalActions();

  const handleDebugger = useCallback(() => {
    showBottomSheetModal({
      content: (
        <DebuggerBottomSheet
          activeSectionId={activeSectionId}
          activeCollectionId={collectionIdBeingEdited}
        />
      ),
    });
  }, [activeSectionId, collectionIdBeingEdited, showBottomSheetModal]);

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
  activeCollectionId: string | null;
};

function DebuggerBottomSheet({ activeSectionId, activeCollectionId }: DebuggerBottomSheetProps) {
  return (
    <View>
      <BaseM>Active Section ID: {activeSectionId}</BaseM>
      <BaseM>Active Collection ID: {activeCollectionId}</BaseM>
    </View>
  );
}
