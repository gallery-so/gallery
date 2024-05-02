import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import { contexts } from 'shared/analytics/constants';

import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { useToastActions } from '~/contexts/ToastContext';
import { GalleryPreviewCardBottomSheetFragment$key } from '~/generated/GalleryPreviewCardBottomSheetFragment.graphql';
import { RootStackNavigatorProp } from '~/navigation/types';

import { BottomSheetRow } from '../BottomSheetRow';
import DeleteGalleryBottomSheet from '../Gallery/DeleteGalleryBottomSheet';
import { useSafeAreaPadding } from '../SafeAreaViewWithPadding';

type Props = {
  galleryRef: GalleryPreviewCardBottomSheetFragment$key;
  onClose: () => void;
};

export function GalleryPreviewCardBottomSheet({ galleryRef, onClose }: Props) {
  const gallery = useFragment(
    graphql`
      fragment GalleryPreviewCardBottomSheetFragment on Gallery {
        dbid
        ...DeleteGalleryBottomSheet
      }
    `,
    galleryRef
  );

  const galleryId = gallery.dbid;

  const { bottom } = useSafeAreaPadding();
  const { pushToast } = useToastActions();

  const { showBottomSheetModal } = useBottomSheetModalActions();
  const navigation = useNavigation<RootStackNavigatorProp>();

  const handleInProgress = useCallback(() => {
    pushToast({
      message: 'Feature in progress',
    });
  }, [pushToast]);

  const handleEditGallery = useCallback(() => {
    navigation.navigate('GalleryEditor', {
      galleryId,
      stagedTokens: [],
    });
    onClose();
  }, [galleryId, navigation, onClose]);

  const handleDeleteGallery = useCallback(() => {
    showBottomSheetModal({
      content: <DeleteGalleryBottomSheet galleryRef={gallery} />,
    });
  }, [gallery, showBottomSheetModal]);

  return (
    <View style={{ paddingBottom: bottom }} className=" flex flex-col space-y-6">
      <View className="flex flex-col space-y-2">
        <BottomSheetRow
          text="Edit Gallery"
          onPress={handleEditGallery}
          eventContext={contexts.UserGallery}
        />
        <BottomSheetRow
          text="Feature on Profile"
          onPress={handleInProgress}
          eventContext={contexts.UserGallery}
        />
        <BottomSheetRow
          text="Hide Gallery"
          onPress={handleInProgress}
          eventContext={contexts.UserGallery}
        />
        <BottomSheetRow
          text="Share Gallery"
          onPress={handleInProgress}
          eventContext={contexts.UserGallery}
        />
        <BottomSheetRow
          text="Delete Gallery"
          onPress={handleDeleteGallery}
          isConfirmationRow
          eventContext={contexts.UserGallery}
        />
      </View>
    </View>
  );
}
