import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import { BottomSheetModalProvider as GorhomBottomSheetModalProvider } from '@gorhom/bottom-sheet';
import clsx from 'clsx';
import { BlurView } from 'expo-blur';
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
import { useReducedMotion } from 'react-native-reanimated';

import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { MainTabStackNavigatorProp } from '~/navigation/types';

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

export const BottomSheetModalActionsContext = createContext<BottomSheetModalActions | undefined>(
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
  noPadding?: boolean;
  onDismiss?: () => void;
  blurBackground?: boolean;
  navigationContext?: MainTabStackNavigatorProp;
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
  }, [bottomSheetModal]);

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
    if (bottomSheetModal) {
      bottomSheetModalRef?.current?.present();
    }
  }, [bottomSheetModal]);

  const reducedMotion = useReducedMotion();

  return (
    <BottomSheetModalActionsContext.Provider value={actions}>
      {children}
      <GorhomBottomSheetModalProvider>
        {bottomSheetModal && (
          <GalleryBottomSheetModal
            snapPoints={animatedSnapPoints}
            handleHeight={animatedHandleHeight}
            contentHeight={animatedContentHeight}
            onDismiss={handleDismissBottomSheetModal}
            animateOnMount={!reducedMotion}
            index={0}
            ref={bottomSheetModalRef}
            android_keyboardInputMode="adjustResize"
            keyboardBlurBehavior="restore"
            backdropComponent={bottomSheetModal?.blurBackground ? BluredBackdrop : null}
            navigationContext={bottomSheetModal?.navigationContext}
          >
            <View
              onLayout={handleContentLayout}
              style={{ paddingBottom: !bottomSheetModal.noPadding ? bottom : 0, maxHeight: 700 }}
              className={clsx('flex ', !bottomSheetModal.noPadding && 'px-4 py-2')}
            >
              {bottomSheetModal.content}
            </View>
          </GalleryBottomSheetModal>
        )}
      </GorhomBottomSheetModalProvider>
    </BottomSheetModalActionsContext.Provider>
  );
}

export default memo(BottomSheetModalProvider);

function BluredBackdrop() {
  return <BlurView intensity={4} className="absolute h-full w-full top-0 bg-black/50 "></BlurView>;
}
