import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import { ForwardedRef, forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { useToastActions } from '~/contexts/ToastContext';
import { GalleryProfileMoreOptionsBottomSheetFragment$key } from '~/generated/GalleryProfileMoreOptionsBottomSheetFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import { useBlockUser } from '~/shared/hooks/useBlockUser';

import { BottomSheetRow } from '../BottomSheetRow';
import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '../GalleryBottomSheet/GalleryBottomSheetModal';
import { useSafeAreaPadding } from '../SafeAreaViewWithPadding';
import { BlockUserConfirmationForm } from './BlockUserConfirmationForm';

type Props = {
  userRef: GalleryProfileMoreOptionsBottomSheetFragment$key;
};

const SNAP_POINTS = ['CONTENT_HEIGHT'];

function GalleryProfileMoreOptionsBottomSheet(
  { userRef }: Props,
  ref: ForwardedRef<GalleryBottomSheetModalType>
) {
  const user = useFragment(
    graphql`
      fragment GalleryProfileMoreOptionsBottomSheetFragment on GalleryUser {
        dbid
        username
      }
    `,
    userRef
  );

  const { bottom } = useSafeAreaPadding();

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const { pushToast } = useToastActions();
  const blockUser = useBlockUser();
  const handleBlockUser = useCallback(async () => {
    try {
      await blockUser(user.dbid);
    } catch (e: unknown) {
      pushToast({ message: "Failed to block user. We're looking into it." });
      return;
    }
  }, [blockUser, pushToast, user.dbid]);

  const handleDismissBottomSheet = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(SNAP_POINTS);

  const [showBlockUserForm, setShowBlockUserForm] = useState(false);

  const handleDisplayBlockForm = useCallback(async () => {
    await handleBlockUser();
    setShowBlockUserForm(true);
  }, [handleBlockUser]);

  const options = useMemo(
    () => (
      <BottomSheetRow
        text={`Block ${user.username}`}
        onPress={handleDisplayBlockForm}
        eventContext={contexts.UserGallery}
        isConfirmationRow
      />
    ),
    [handleDisplayBlockForm, user.username]
  );

  const handleResetState = useCallback(() => {
    setShowBlockUserForm(false);
  }, []);

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
      onDismiss={handleResetState}
    >
      <View
        onLayout={handleContentLayout}
        style={{ paddingBottom: bottom }}
        className="p-4 flex flex-col space-y-6"
      >
        {showBlockUserForm ? (
          <BlockUserConfirmationForm
            userId={user.dbid}
            username={user.username ?? ''}
            onBlockUser={handleBlockUser}
            onDismiss={handleDismissBottomSheet}
          />
        ) : (
          <View className="flex flex-col space-y-2">{options}</View>
        )}
      </View>
    </GalleryBottomSheetModal>
  );
}

const ForwardedGalleryProfileMoreOptionsBottomSheet = forwardRef(
  GalleryProfileMoreOptionsBottomSheet
);

export { ForwardedGalleryProfileMoreOptionsBottomSheet as GalleryProfileMoreOptionsBottomSheet };
