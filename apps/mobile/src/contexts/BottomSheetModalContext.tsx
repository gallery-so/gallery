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

const SNAP_POINTS = ['50%']; // Example snap points, adjust based on your needs

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
};

function BottomSheetModalProvider({ children }: BottomSheetModalProviderProps) {
  const [bottomSheetModalContent, setBottomSheetModalContent] = useState<BottomSheetModal>();
  const bottomSheetModalRef = useRef<GalleryBottomSheetModalType | null>(null);

  const showBottomSheetModal = useCallback((modal: BottomSheetModal) => {
    setBottomSheetModalContent(modal);
  }, []);

  const hideBottomSheetModal = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
    // delay clearing the content to allow the modal to animate out
    setTimeout(() => setBottomSheetModalContent(undefined), 300);
  }, []);

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
  }, [bottomSheetModalContent]);

  return (
    <GorhomBottomSheetModalProvider>
      <BottomSheetModalActionsContext.Provider value={actions}>
        {children}
        {bottomSheetModalContent && (
          <GalleryBottomSheetModal
            snapPoints={animatedSnapPoints}
            handleHeight={animatedHandleHeight}
            contentHeight={animatedContentHeight}
            onDismiss={hideBottomSheetModal}
            index={0}
            ref={bottomSheetModalRef}
          >
            <View
              onLayout={handleContentLayout}
              style={{ paddingBottom: bottom }}
              className="p-4 flex flex-col space-y-6"
            >
              {bottomSheetModalContent.content}
            </View>
          </GalleryBottomSheetModal>
        )}
      </BottomSheetModalActionsContext.Provider>
    </GorhomBottomSheetModalProvider>
  );
}

export default memo(BottomSheetModalProvider);
