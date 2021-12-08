import { AbstractConnector } from '@web3-react/abstract-connector';

import { Web3Error } from 'types/Error';
import { GNOSIS_SAFE, WalletName } from 'types/Wallet';
import AddWalletPendingDefault from './AddWalletPendingDefault';
import AddWalletPendingGnosisSafe from './AddWalletPendingGnosisSafe';

type Props = {
  pendingWallet: AbstractConnector;
  userFriendlyWalletName: string;
  setDetectedError: (error: Web3Error) => void;
  walletName: WalletName;
};

// This Pending screen is dislayed after the connector has been activated, while we wait for a signature
function AddWalletPending({
  pendingWallet,
  userFriendlyWalletName,
  setDetectedError,
  walletName,
}: Props) {
  if (walletName === GNOSIS_SAFE) {
    return (
      <AddWalletPendingGnosisSafe
        pendingWallet={pendingWallet}
        userFriendlyWalletName={userFriendlyWalletName}
        setDetectedError={setDetectedError}
      />
    );
  }

  return (
    <AddWalletPendingDefault
      pendingWallet={pendingWallet}
      userFriendlyWalletName={userFriendlyWalletName}
      setDetectedError={setDetectedError}
      walletName={walletName}
    />
  );
}

export default AddWalletPending;
