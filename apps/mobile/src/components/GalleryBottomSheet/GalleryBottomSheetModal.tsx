// eslint-disable-next-line no-restricted-imports
import { BottomSheetModal, BottomSheetModalProps } from '@gorhom/bottom-sheet';
import { NavigationContext, useNavigation } from '@react-navigation/native';
import { ForwardedRef, forwardRef, useEffect, useRef } from 'react';
import { Keyboard } from 'react-native';

import { GalleryBottomSheetBackdrop } from '~/components/GalleryBottomSheet/GalleryBottomSheetBackdrop';
import { GalleryBottomSheetBackground } from '~/components/GalleryBottomSheet/GalleryBottomSheetBackground';
import { GalleryBottomSheetHandle } from '~/components/GalleryBottomSheet/GalleryBottomSheetHandle';

export type GalleryBottomSheetModalType = BottomSheetModal;

function GalleryBottomSheetModal(
  { children, ...props }: BottomSheetModalProps,
  ref: ForwardedRef<GalleryBottomSheetModalType>
) {
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
        borderRadius: 20,
      }}
      backgroundComponent={GalleryBottomSheetBackground}
      backdropComponent={GalleryBottomSheetBackdrop}
      handleComponent={GalleryBottomSheetHandle}
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

const ForwardedGalleryBottomSheetModal = forwardRef<BottomSheetModal, BottomSheetModalProps>(
  GalleryBottomSheetModal
);

export { ForwardedGalleryBottomSheetModal as GalleryBottomSheetModal };
