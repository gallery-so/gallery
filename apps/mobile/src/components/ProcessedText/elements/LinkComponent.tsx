import { useCallback } from 'react';
import { Text } from 'react-native';

import WarningLinkBottomSheet from '~/components/Feed/Posts/WarningLinkBottomSheet';
import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';

type Props = {
  value?: string;
  url: string;
};

export function LinkComponent({ url, value }: Props) {
  const { showBottomSheetModal } = useBottomSheetModalActions();
  const handleLinkPress = useCallback(() => {
    showBottomSheetModal({
      content: <WarningLinkBottomSheet redirectUrl={url} />,
    });
  }, [showBottomSheetModal, url]);

  return (
    <Text className="text-shadow" onPress={handleLinkPress}>
      {value ?? url}
    </Text>
  );
}
