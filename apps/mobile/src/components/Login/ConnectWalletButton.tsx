import { useCallback } from 'react';

import { useManageWalletActions } from '~/contexts/ManageWalletContext';

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
      eventElementId={null}
      eventName={null}
      loading={isSigningIn}
    />
  );
}
