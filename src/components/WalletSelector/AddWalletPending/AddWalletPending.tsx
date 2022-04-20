import { AbstractConnector } from '@web3-react/abstract-connector';
import { graphql, useFragment } from 'react-relay';

import { Web3Error } from 'types/Error';
import { GNOSIS_SAFE, WalletName } from 'types/Wallet';
import { AddWalletPendingFragment$key } from '__generated__/AddWalletPendingFragment.graphql';
import AddWalletPendingDefault from './AddWalletPendingDefault';
import AddWalletPendingGnosisSafe from './AddWalletPendingGnosisSafe';

type Props = {
  queryRef: AddWalletPendingFragment$key;
  pendingWallet: AbstractConnector;
  userFriendlyWalletName: string;
  setDetectedError: (error: Web3Error) => void;
  walletName: WalletName;
};

// This Pending screen is dislayed after the connector has been activated, while we wait for a signature
function AddWalletPending({
  queryRef,
  pendingWallet,
  userFriendlyWalletName,
  setDetectedError,
  walletName,
}: Props) {
  const query = useFragment(
    graphql`
      fragment AddWalletPendingFragment on Query {
        ...AddWalletPendingGnosisSafeFragment
        ...AddWalletPendingDefaultFragment
      }
    `,
    queryRef
  );

  if (walletName === GNOSIS_SAFE) {
    return (
      <AddWalletPendingGnosisSafe
        queryRef={query}
        pendingWallet={pendingWallet}
        userFriendlyWalletName={userFriendlyWalletName}
        setDetectedError={setDetectedError}
      />
    );
  }

  return (
    <AddWalletPendingDefault
      queryRef={query}
      pendingWallet={pendingWallet}
      userFriendlyWalletName={userFriendlyWalletName}
      setDetectedError={setDetectedError}
      walletName={walletName}
    />
  );
}

export default AddWalletPending;
