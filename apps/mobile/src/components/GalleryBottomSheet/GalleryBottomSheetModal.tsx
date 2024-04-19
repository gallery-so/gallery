// eslint-disable-next-line no-restricted-imports
import { ANIMATION_CONFIGS, BottomSheetModal, BottomSheetModalProps } from '@gorhom/bottom-sheet';
import { NavigationContext } from '@react-navigation/native';
import { ForwardedRef, forwardRef, useEffect, useRef } from 'react';
import { Keyboard, Platform } from 'react-native';
import { ReduceMotion, SharedValue } from 'react-native-reanimated';

import { GalleryBottomSheetBackdrop } from '~/components/GalleryBottomSheet/GalleryBottomSheetBackdrop';
import { GalleryBottomSheetBackground } from '~/components/GalleryBottomSheet/GalleryBottomSheetBackground';
import { GalleryBottomSheetHandle } from '~/components/GalleryBottomSheet/GalleryBottomSheetHandle';
import SyncTokensProvider from '~/contexts/SyncTokensContext';
import { LoginStackNavigatorProp, MainTabStackNavigatorProp } from '~/navigation/types';

export type GalleryBottomSheetModalType = BottomSheetModal;

type GalleryBottomSheetModalProps = {
  navigationContext?: MainTabStackNavigatorProp | LoginStackNavigatorProp;
  children: React.ReactNode;
  snapPoints:
    | Readonly<{ value: (string | number)[] }>
    | (string | number)[]
    | SharedValue<(string | number)[]>;
} & Omit<BottomSheetModalProps, 'snapPoints'>;

function GalleryBottomSheetModal(
  { navigationContext, children, ...props }: GalleryBottomSheetModalProps,
  ref: ForwardedRef<GalleryBottomSheetModalType>
) {
  const { snapPoints, backdropComponent, ...rest } = props;

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  useEffect(
    function closeBottomSheetWhenNavigating() {
      if (!navigationContext) {
        return;
      }

      const removeListener = navigationContext.addListener('blur', () => {
        Keyboard.dismiss();
        bottomSheetRef.current?.dismiss();
      });

      return removeListener;
    },
    [navigationContext]
  );

  const androidAnimationConfigs = {
    ...ANIMATION_CONFIGS,
    reduceMotion: ReduceMotion.Never,
  };

  return (
    <BottomSheetModal
      animationConfigs={Platform.OS === 'android' ? androidAnimationConfigs : undefined}
      ref={(element) => {
        bottomSheetRef.current = element;
        if (typeof ref === 'function') {
          ref(element);
        } else if (ref) {
          ref.current = element;
        }
      }}
      backgroundStyle={{
        borderRadius: 20,
      }}
      backgroundComponent={GalleryBottomSheetBackground}
      backdropComponent={backdropComponent || GalleryBottomSheetBackdrop}
      handleComponent={GalleryBottomSheetHandle}
      snapPoints={snapPoints as (string | number)[] | SharedValue<(string | number)[]>}
      {...rest}
    >
      {/* Pass the parent's navigation down to this bottom sheet so it has */}
      {/* all of the context that its parent did. We may need to do more of this in the future */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <NavigationContext.Provider value={navigationContext as any}>
        <SyncTokensProvider>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {children as any}
        </SyncTokensProvider>
      </NavigationContext.Provider>
    </BottomSheetModal>
  );
}

const ForwardedGalleryBottomSheetModal = forwardRef<BottomSheetModal, GalleryBottomSheetModalProps>(
  GalleryBottomSheetModal
);

export { ForwardedGalleryBottomSheetModal as GalleryBottomSheetModal };
