import { useCallback } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';
import useDeleteGallery from 'shared/hooks/useDeleteGallery';

import { Button } from '~/components/Button';
import { Typography } from '~/components/Typography';
import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { DeleteGalleryBottomSheet$key } from '~/generated/DeleteGalleryBottomSheet.graphql';
import { contexts } from '~/shared/analytics/constants';

type Props = {
  galleryRef: DeleteGalleryBottomSheet$key;
};

export default function DeleteGalleryBottomSheet({ galleryRef }: Props) {
  const gallery = useFragment(
    graphql`
      fragment DeleteGalleryBottomSheet on Gallery {
        dbid
      }
    `,
    galleryRef
  );
  const deleteGallery = useDeleteGallery();
  const { hideBottomSheetModal } = useBottomSheetModalActions();

  const handleBack = useCallback(() => {
    hideBottomSheetModal();
  }, [hideBottomSheetModal]);

  const handleDelete = useCallback(() => {
    deleteGallery(gallery.dbid);
    hideBottomSheetModal();
  }, [deleteGallery, gallery, hideBottomSheetModal]);

  return (
    <View className="flex flex-col space-y-6">
      <View className="flex flex-col space-y-4">
        <Typography
          className="text-lg text-black-900 dark:text-offWhite"
          font={{ family: 'ABCDiatype', weight: 'Bold' }}
        >
          Delete gallery
        </Typography>
        <Typography
          className="text-lg text-black-900 dark:text-offWhite"
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
        >
          Are you sure you want to delete this gallery?
        </Typography>
      </View>

      <View className="space-y-2">
        <Button
          onPress={handleDelete}
          text="DELETE"
          eventElementId="Delete Gallery Button"
          eventName="Delete Gallery"
          eventContext={contexts.UserGallery}
        />
        <Button
          onPress={handleBack}
          variant="secondary"
          text="CANCEL"
          eventElementId="Cancel Delete Gallery Button"
          eventName="Cancel Delete Gallery"
          eventContext={contexts.UserGallery}
        />
      </View>
    </View>
  );
}
