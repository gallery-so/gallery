import { useNavigation } from '@react-navigation/native';
import { forwardRef, useCallback } from 'react';
import { View } from 'react-native';
import { EmailIcon } from 'src/icons/EmailIcon';
import { FarcasterOutlineIcon } from 'src/icons/FarcasterOutlineIcon';
import { QRCodeIcon } from 'src/icons/QRCodeIcon';
import { WalletIcon } from 'src/icons/WalletIcon';

import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { OpenManageWalletProps } from '~/contexts/ManageWalletContext';
import { LoginStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';

import { BottomSheetRow } from '../BottomSheetRow';
import { Typography } from '../Typography';
import { useLoginWithFarcaster } from './AuthProvider/Farcaster/FarcasterAuthProvider';

type Props = {
  onQrCodePress: () => void;
  openManageWallet: (o: OpenManageWalletProps) => void;
};

function SignInBottomSheet({ onQrCodePress, openManageWallet }: Props) {
  const { hideBottomSheetModal } = useBottomSheetModalActions();
  const navigation = useNavigation<LoginStackNavigatorProp>();

  const handleEmailPress = useCallback(() => {
    hideBottomSheetModal();
    navigation.navigate('OnboardingEmail', {
      authMethod: 'Privy',
    });
  }, [hideBottomSheetModal, navigation]);

  const handleConnectWallet = useCallback(() => {
    hideBottomSheetModal();
    openManageWallet({ method: 'auth' });
  }, [hideBottomSheetModal, openManageWallet]);

  const { open: handleConnectFarcaster } = useLoginWithFarcaster();

  return (
    <View className="flex flex-col space-y-6">
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
          icon={<EmailIcon />}
          text="Email"
          onPress={handleEmailPress}
          eventContext={contexts.Authentication}
          fontWeight="Bold"
        />
        <BottomSheetRow
          icon={<WalletIcon />}
          text="Wallet"
          onPress={handleConnectWallet}
          eventContext={contexts.Authentication}
          fontWeight="Bold"
        />
        <BottomSheetRow
          icon={<FarcasterOutlineIcon />}
          text="Farcaster"
          onPress={handleConnectFarcaster}
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
  );
}

const ForwardedSignInBottomSheet = forwardRef(SignInBottomSheet);

export { ForwardedSignInBottomSheet as SignInBottomSheet };
