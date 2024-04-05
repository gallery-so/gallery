import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import { BottomSheetModalProvider as GorhomBottomSheetModalProvider } from '@gorhom/bottom-sheet';
import React, {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View } from 'react-native';

import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';

const SNAP_POINTS = ['CONTENT_HEIGHT']; // Example snap points, adjust based on your needs

type BottomSheetModalState = {
  isBottomSheetModalVisible: boolean;
};
const BottomSheetModalStateContext = createContext<BottomSheetModalState | undefined>(undefined);

export const useBottomSheetModalState = (): BottomSheetModalState => {
  const context = useContext(BottomSheetModalStateContext);
  if (!context) {
    throw new Error('Attempted to use BottomSheetModalStateContext without a provider!');
  }
  return context;
};

type BottomSheetModalActions = {
  showBottomSheetModal: (bottomSheetModal: BottomSheetModal) => void;
  hideBottomSheetModal: () => void;
};

const BottomSheetModalActionsContext = createContext<BottomSheetModalActions | undefined>(
  undefined
);

export const useBottomSheetModalActions = (): BottomSheetModalActions => {
  const context = useContext(BottomSheetModalActionsContext);
  if (!context) {
    throw new Error('Attempted to use BottomSheetModalActionsContext without a provider!');
  }
  return context;
};

type BottomSheetModalProviderProps = {
  children: React.ReactNode;
};

type BottomSheetModal = {
  content: React.ReactNode;
  onDismiss?: () => void;
};

function BottomSheetModalProvider({ children }: BottomSheetModalProviderProps) {
  const [bottomSheetModal, setBottomSheetModal] = useState<BottomSheetModal>();
  const bottomSheetModalRef = useRef<GalleryBottomSheetModalType | null>(null);

  const showBottomSheetModal = useCallback((modal: BottomSheetModal) => {
    setBottomSheetModal(modal);
  }, []);

  const hideBottomSheetModal = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
    // delay clearing the content to allow the modal to animate out
    setTimeout(() => setBottomSheetModal(undefined), 300);
  }, []);

  const handleDismissBottomSheetModal = useCallback(() => {
    if (bottomSheetModal?.onDismiss) {
      bottomSheetModal.onDismiss();
    }
    hideBottomSheetModal();
  }, [bottomSheetModal, hideBottomSheetModal]);

  const { bottom } = useSafeAreaPadding(); // Use this for handling safe area, if necessary

  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(SNAP_POINTS);

  const actions = useMemo(
    () => ({
      showBottomSheetModal,
      hideBottomSheetModal,
    }),
    [showBottomSheetModal, hideBottomSheetModal]
  );

  // immediately present the modal when content is set
  useEffect(() => {
    bottomSheetModalRef?.current?.present();
  }, [bottomSheetModal]);

  return (
    <GorhomBottomSheetModalProvider>
      <BottomSheetModalActionsContext.Provider value={actions}>
        {children}
        {bottomSheetModal && (
          <GalleryBottomSheetModal
            snapPoints={animatedSnapPoints}
            handleHeight={animatedHandleHeight}
            contentHeight={animatedContentHeight}
            onDismiss={handleDismissBottomSheetModal}
            index={0}
            ref={bottomSheetModalRef}
          >
            <View
              onLayout={handleContentLayout}
              style={{ paddingBottom: bottom }}
              className="p-4 flex flex-col space-y-6"
            >
              {bottomSheetModal.content}
            </View>
          </GalleryBottomSheetModal>
        )}
      </BottomSheetModalActionsContext.Provider>
    </GorhomBottomSheetModalProvider>
  );
}

export default memo(BottomSheetModalProvider);
