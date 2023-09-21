import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';

import { useManageWalletActions } from '~/contexts/ManageWalletContext';
import { LoginStackNavigatorProp } from '~/navigation/types';
import { navigateToNotificationUpsellOrHomeScreen } from '~/screens/Login/navigateToNotificationUpsellOrHomeScreen';

import { Button } from '../../components/Button';

export function ConnectWalletButton() {
  const { isSigningIn, openManageWallet } = useManageWalletActions();
  const navigation = useNavigation<LoginStackNavigatorProp>();

  const handleLogin = useCallback(async () => {
    await navigateToNotificationUpsellOrHomeScreen(navigation);
  }, [navigation]);

  const handleConnectWallet = useCallback(() => {
    openManageWallet({
      method: 'auth',
      onSuccess: () => handleLogin(),
    });
  }, [handleLogin, openManageWallet]);

  return (
    <Button
      onPress={handleConnectWallet}
      text="connect wallet"
      eventElementId={null}
      eventName={null}
      loading={isSigningIn}
    />
  );
}
