// eslint-disable-next-line no-restricted-imports
import { BottomSheetModal, BottomSheetModalProps } from '@gorhom/bottom-sheet';
import { NavigationContext, useNavigation } from '@react-navigation/native';
import { ForwardedRef, forwardRef, useEffect, useRef } from 'react';
import { Keyboard } from 'react-native';

import { GalleryBottomSheetBackdrop } from '~/components/GalleryBottomSheet/GalleryBottomSheetBackdrop';
import { GalleryBottomSheetBackground } from '~/components/GalleryBottomSheet/GalleryBottomSheetBackground';
import { GalleryBottomSheetHandle } from '~/components/GalleryBottomSheet/GalleryBottomSheetHandle';

export type GalleryBottomSheetModalType = BottomSheetModal;

type GalleryBottomSheetModalProps = {
  border?: boolean;
} & Omit<BottomSheetModalProps, 'backgroundComponent' | 'backdropComponent'>;

function GalleryBottomSheetModal(
  { children, border, ...props }: GalleryBottomSheetModalProps,
  ref: ForwardedRef<GalleryBottomSheetModalType>
) {
  const borderRadius = border ? 20 : 0;
  const navigation = useNavigation();

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  useEffect(
    function closeBottomSheetWhenNavigating() {
      const removeListener = navigation.addListener('blur', () => {
        Keyboard.dismiss();
        bottomSheetRef.current?.dismiss();
      });

      return removeListener;
    },
    [navigation]
  );

  return (
    <BottomSheetModal
      ref={(element) => {
        bottomSheetRef.current = element;
        if (typeof ref === 'function') {
          ref(element);
        } else if (ref) {
          ref.current = element;
        }
      }}
      backgroundStyle={{
        borderRadius,
      }}
      backgroundComponent={GalleryBottomSheetBackground}
      handleComponent={GalleryBottomSheetHandle}
      // Hack to avoid flickering backdrop when using `useBottomSheetDynamicSnapPoints`
      // issue: https://github.com/gorhom/react-native-bottom-sheet/issues/436
      containerStyle={{
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}
      backdropComponent={GalleryBottomSheetBackdrop}
      {...props}
    >
      {/* Pass the parent's navigation down to this bottom sheet so it has */}
      {/* all of the context that its parent did. We may need to do more of this in the future */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <NavigationContext.Provider value={navigation as any}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {children as any}
      </NavigationContext.Provider>
    </BottomSheetModal>
  );
}

const ForwardedGalleryBottomSheetModal = forwardRef<BottomSheetModal, GalleryBottomSheetModalProps>(
  GalleryBottomSheetModal
);

export { ForwardedGalleryBottomSheetModal as GalleryBottomSheetModal };
