/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useRef } from 'react';
import { Text } from 'react-native';

import { WarningLinkBottomSheet } from '~/components/Feed/Posts/WarningLinkBottomSheet';
import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';

type Props = {
  value?: string;
  url: string;
};

export function LinkComponent({ url, value }: Props) {
  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);
  const handleLinkPress = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  return (
    <>
      <Text>{value ?? url}</Text>
      <WarningLinkBottomSheet redirectUrl={url} ref={bottomSheetRef} />
    </>
  );
}
