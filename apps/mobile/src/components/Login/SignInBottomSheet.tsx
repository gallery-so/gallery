import { useBottomSheetDynamicSnapPoints } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import { ForwardedRef, forwardRef, useCallback, useRef } from 'react';
import { View } from 'react-native';
import { EmailIcon } from 'src/icons/EmailIcon';
// import { FarcasterOutlineIcon } from 'src/icons/FarcasterOutlineIcon';
import { QRCodeIcon } from 'src/icons/QRCodeIcon';
import { WalletIcon } from 'src/icons/WalletIcon';

import { useManageWalletActions } from '~/contexts/ManageWalletContext';
import { LoginStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';

import { BottomSheetRow } from '../BottomSheetRow';
import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '../GalleryBottomSheet/GalleryBottomSheetModal';
import { useSafeAreaPadding } from '../SafeAreaViewWithPadding';
import { Typography } from '../Typography';
// import { useLoginWithFarcaster } from './AuthProvider/Farcaster/FarcasterAuthProvider';

const SNAP_POINTS = ['CONTENT_HEIGHT'];

type Props = {
  onQrCodePress: () => void;
};

function SignInBottomSheet(
  { onQrCodePress }: Props,
  ref: ForwardedRef<GalleryBottomSheetModalType>
) {
  const { bottom } = useSafeAreaPadding();
  const { openManageWallet } = useManageWalletActions();

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);

  const navigation = useNavigation<LoginStackNavigatorProp>();
  const { animatedHandleHeight, animatedSnapPoints, animatedContentHeight, handleContentLayout } =
    useBottomSheetDynamicSnapPoints(SNAP_POINTS);

  const handleEmailPress = useCallback(() => {
    navigation.navigate('OnboardingEmail', {
      authMethod: 'Email',
    });
  }, [navigation]);

  const handleConnectWallet = useCallback(() => {
    bottomSheetRef.current?.dismiss();
    openManageWallet({ method: 'auth' });
  }, [openManageWallet]);

  // const { open: handleConnectFarcaster } = useLoginWithFarcaster();

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
            Sign in or sign up
          </Typography>
        </View>

        <View className="flex flex-col space-y-2">
          <BottomSheetRow
            icon={<WalletIcon />}
            text="Wallet"
            onPress={handleConnectWallet}
            eventContext={contexts.Authentication}
            fontWeight="Bold"
          />
          {/* <BottomSheetRow
            icon={<FarcasterOutlineIcon />}
            text="Farcaster"
            onPress={handleConnectFarcaster}
            eventContext={contexts.Authentication}
            fontWeight="Bold"
          /> */}
          <BottomSheetRow
            icon={<EmailIcon />}
            text="Email"
            onPress={handleEmailPress}
            eventContext={contexts.Authentication}
            fontWeight="Bold"
          />
          <BottomSheetRow
            icon={<QRCodeIcon width={24} height={24} />}
            text="Sign in via Desktop"
            onPress={onQrCodePress}
            eventContext={contexts.Authentication}
            fontWeight="Bold"
          />
        </View>
      </View>
    </GalleryBottomSheetModal>
  );
}

const ForwardedSignInBottomSheet = forwardRef(SignInBottomSheet);

export { ForwardedSignInBottomSheet as SignInBottomSheet };
