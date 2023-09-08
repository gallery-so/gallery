import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { ForwardedRef, forwardRef, useCallback, useRef } from 'react';
import { View } from 'react-native';
import { EmailIcon } from 'src/icons/EmailIcon';
import { QRCodeIcon } from 'src/icons/QRCodeIcon';

import { LoginStackNavigatorProp } from '~/navigation/types';

import { BottomSheetRow } from '../Feed/Posts/PostBottomSheet';
import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '../GalleryBottomSheet/GalleryBottomSheetModal';
import { useSafeAreaPadding } from '../SafeAreaViewWithPadding';
import { Typography } from '../Typography';

const SNAP_POINTS = ['CONTENT_HEIGHT'];

type Props = {
  onQrCodePress: () => void;
};

function SignInBottomSheet(
  { onQrCodePress }: Props,
  ref: ForwardedRef<GalleryBottomSheetModalType>
) {
  const { bottom } = useSafeAreaPadding();

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const navigation = useNavigation<LoginStackNavigatorProp>();
  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(SNAP_POINTS);

  const handleEmailPress = useCallback(() => {
    navigation.navigate('OnboardingEmail');
  }, [navigation]);

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
            Other sign in method
          </Typography>
        </View>

        <View className="flex flex-col space-y-2">
          <BottomSheetRow icon={<EmailIcon />} text="Email" onPress={handleEmailPress} />
          <BottomSheetRow
            icon={<QRCodeIcon width={24} height={24} />}
            text="QR Code (Sync with desktop)"
            onPress={onQrCodePress}
          />
        </View>
      </View>
    </GalleryBottomSheetModal>
  );
}

const ForwardedSignInBottomSheet = forwardRef(SignInBottomSheet);

export { ForwardedSignInBottomSheet as SignInBottomSheet };
