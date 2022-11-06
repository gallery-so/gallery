import { AbstractConnector } from '@web3-react/abstract-connector';

import { Web3Error } from '~/types/Error';
import { GNOSIS_SAFE, WalletName } from '~/types/Wallet';

import AuthenticateWalletPendingDefault from './AuthenticateWalletPendingDefault';
import AuthenticateWalletPendingGnosisSafe from './AuthenticateWalletPendingGnosisSafe';

type Props = {
  pendingWallet: AbstractConnector;
  userFriendlyWalletName: string;
  setDetectedError: (error: Web3Error) => void;
  walletName: WalletName;
};

// This Pending screen is dislayed after the connector has been activated, while we wait for a signature.
// It is responsible for triggering logic to retrieve a nonce, prompt the user to sign it, and authenticate the user.

// AuthenticateWalletPendingDefault is the default implementation of the AuthenticateWalletPending component.å
// Some wallets require unique business logic, so we have a separate component for those, like Gnosis Safe.

function AuthenticateWalletPending({
  pendingWallet,
  userFriendlyWalletName,
  setDetectedError,
  walletName,
}: Props) {
  if (walletName === GNOSIS_SAFE) {
    return (
      <AuthenticateWalletPendingGnosisSafe
        pendingWallet={pendingWallet}
        userFriendlyWalletName={userFriendlyWalletName}
        setDetectedError={setDetectedError}
      />
    );
  }

  return (
    <AuthenticateWalletPendingDefault
      pendingWallet={pendingWallet}
      userFriendlyWalletName={userFriendlyWalletName}
      setDetectedError={setDetectedError}
    />
  );
}

export default AuthenticateWalletPending;
