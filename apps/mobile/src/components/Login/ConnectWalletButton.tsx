import { useCallback } from 'react';

import { useManageWalletActions } from '~/contexts/ManageWalletContext';
import { contexts } from '~/shared/analytics/constants';

import { Button } from '../../components/Button';

export function ConnectWalletButton() {
  const { isSigningIn, openManageWallet } = useManageWalletActions();

  const handleConnectWallet = useCallback(() => {
    openManageWallet({
      method: 'auth',
    });
  }, [openManageWallet]);

  return (
    <Button
      onPress={handleConnectWallet}
      text="connect wallet"
      eventElementId="Connect Wallet on Sign In Button"
      eventName="Connect Wallet on Sign In"
      eventContext={contexts.Authentication}
      loading={isSigningIn}
    />
  );
}
