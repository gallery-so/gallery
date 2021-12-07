import { AbstractConnector } from '@web3-react/abstract-connector';

import { Web3Error } from 'types/Error';
import { WalletName, GNOSIS_SAFE } from 'types/Wallet';

import AuthenticateWalletPendingGnosisSafe from './AuthenticateWalletPendingGnosisSafe';
import AuthenticateWalletPendingDefault from './AuthenticateWalletPendingDefault';

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
        {...{ pendingWallet, userFriendlyWalletName, setDetectedError }}
      />
    );
  }

  return (
    <AuthenticateWalletPendingDefault
      {...{ pendingWallet, userFriendlyWalletName, setDetectedError }}
    />
  );
}

export default AuthenticateWalletPending;
