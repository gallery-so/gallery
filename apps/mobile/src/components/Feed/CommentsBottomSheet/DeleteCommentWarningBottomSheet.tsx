import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import { ForwardedRef, forwardRef, useCallback, useRef } from 'react';
import { View } from 'react-native';

import { Button } from '~/components/Button';
import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { Typography } from '~/components/Typography';
import { contexts } from '~/shared/analytics/constants';

const SNAP_POINTS = ['CONTENT_HEIGHT'];

type Props = {
  onRemoveComment: () => void;
  onDismiss: () => void;
};

function DeleteCommentWarningBottomSheet(
  { onRemoveComment, onDismiss }: Props,
  ref: ForwardedRef<GalleryBottomSheetModalType>
) {
  const { bottom } = useSafeAreaPadding();

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(SNAP_POINTS);

  const handleBack = useCallback(() => {
    onDismiss();
    bottomSheetRef.current?.dismiss();
  }, [onDismiss]);

  const handleDelete = useCallback(() => {
    onRemoveComment();
    handleBack();
  }, [handleBack, onRemoveComment]);

  return (
    <GalleryBottomSheetModal
      ref={(value) => {
        bottomSheetRef.current = value;

        if (typeof ref === 'function') {
          ref(value);
        } else if (ref) {
          ref.current = value;
        }
      }}
      snapPoints={animatedSnapPoints}
      handleHeight={animatedHandleHeight}
      contentHeight={animatedContentHeight}
      onDismiss={onDismiss}
    >
      <View
        onLayout={handleContentLayout}
        style={{ paddingBottom: bottom }}
        className="p-4 flex flex-col space-y-6"
      >
        <View className="flex flex-col space-y-4">
          <Typography
            className="text-lg text-black-900 dark:text-offWhite"
            font={{ family: 'ABCDiatype', weight: 'Bold' }}
          >
            Delete Comment
          </Typography>
          <Typography
            className="text-lg text-black-900 dark:text-offWhite"
            font={{ family: 'ABCDiatype', weight: 'Regular' }}
          >
            Are you sure you want to delete this comment?
          </Typography>
        </View>

        <View className="space-y-2">
          <Button
            onPress={handleDelete}
            text="Delete"
            eventElementId="Delete Comment Button"
            eventName="Press Delete Comment Button"
            eventContext={contexts.Posts}
          />

          <Button
            variant="secondary"
            onPress={handleBack}
            text="Nevermind"
            eventElementId="Discard Delete Comment Button"
            eventName="Press Discard Delete Comment Button"
            eventContext={contexts.Posts}
          />
        </View>
      </View>
    </GalleryBottomSheetModal>
  );
}

const ForwardedDeleteCommentWarningBottomSheet = forwardRef(DeleteCommentWarningBottomSheet);

export { ForwardedDeleteCommentWarningBottomSheet as DeleteCommentWarningBottomSheet };
