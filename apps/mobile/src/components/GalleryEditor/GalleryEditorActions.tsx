import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { contexts } from 'shared/analytics/constants';
import { NftIcon } from 'src/icons/NftIcon';
import { PlusIcon } from 'src/icons/PlusIcon';
import { TrashIcon } from 'src/icons/TrashIcon';

import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { useGalleryEditorActions } from '~/contexts/GalleryEditor/GalleryEditorContext';
import { useToastActions } from '~/contexts/ToastContext';
import { RootStackNavigatorProp } from '~/navigation/types';

import { BottomSheetRow } from '../BottomSheetRow';
import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { useSafeAreaPadding } from '../SafeAreaViewWithPadding';
import { BaseM } from '../Text';

export function GalleryEditorActions() {
  const { activeRowId, sectionIdBeingEdited } = useGalleryEditorActions();

  const { pushToast } = useToastActions();
  const { showBottomSheetModal, hideBottomSheetModal } = useBottomSheetModalActions();

  const { bottom } = useSafeAreaPadding();

  const handleAddItem = useCallback(() => {
    showBottomSheetModal({
      content: <GalleryEditorActionsBottomSheet onClose={hideBottomSheetModal} />,
    });
  }, [hideBottomSheetModal, showBottomSheetModal]);

  const handleDeleteItem = useCallback(() => {
    pushToast({
      message: 'WIP',
    });
  }, [pushToast]);

  const hasSectionOrRowSelected = useMemo(() => {
    return activeRowId || sectionIdBeingEdited;
  }, [activeRowId, sectionIdBeingEdited]);

  if (!hasSectionOrRowSelected) {
    return null;
  }

  return (
    <View
      style={{ bottom: bottom }}
      className=" absolute w-full flex-row space-x-4 items-center justify-center"
    >
      <GalleryTouchableOpacity
        onPress={handleAddItem}
        eventElementId={null}
        eventName={null}
        eventContext={null}
        className="bg-white h-12 w-12 border border-activeBlue rounded-full items-center justify-center"
      >
        <PlusIcon />
      </GalleryTouchableOpacity>
      <GalleryTouchableOpacity
        onPress={handleDeleteItem}
        eventElementId={null}
        eventName={null}
        eventContext={null}
        className="bg-white h-12 w-12 border border-red/25 rounded-full items-center justify-center"
      >
        <TrashIcon />
      </GalleryTouchableOpacity>
    </View>
  );
}

type GalleryEditorActionsBottomSheetProps = {
  onClose: () => void;
};

function GalleryEditorActionsBottomSheet({ onClose }: GalleryEditorActionsBottomSheetProps) {
  const { bottom } = useSafeAreaPadding();
  const navigation = useNavigation<RootStackNavigatorProp>();

  const handleAddNft = useCallback(() => {
    onClose();
    navigation.navigate('NftSelectorGalleryEditor');
  }, [navigation, onClose]);

  return (
    <View style={{ paddingBottom: bottom }} className=" flex flex-col space-y-4">
      <BaseM weight="Bold" classNameOverride="text-lg">
        Add
      </BaseM>
      <View className="flex flex-col space-y-2">
        <BottomSheetRow
          text="NFT"
          icon={<NftIcon />}
          onPress={handleAddNft}
          eventContext={contexts.UserGallery}
        />
      </View>
    </View>
  );
}
