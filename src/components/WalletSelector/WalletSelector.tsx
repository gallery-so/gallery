import dynamic from 'next/dynamic';
import { graphql, useFragment } from 'react-relay';

import { WalletSelectorFragment$key } from '~/generated/WalletSelectorFragment.graphql';
import { ADD_WALLET_TO_USER, AUTH, CONNECT_WALLET_ONLY } from '~/types/Wallet';

import type { WalletSelectorVariant } from './multichain/MultichainWalletSelector';
const MultichainWalletSelector = dynamic(() => import('./multichain/MultichainWalletSelector'), {
  suspense: true,
});

// AUTH: authenticate with wallet (sign in)
// ADD_WALLET_TO_USER: add wallet to user
// CONNECT_WALLET: simple connect (no sign in) used to allow non-users to mint

export type ConnectionMode = typeof AUTH | typeof ADD_WALLET_TO_USER | typeof CONNECT_WALLET_ONLY;

type Props = {
  connectionMode?: ConnectionMode;
  queryRef: WalletSelectorFragment$key;
  variant?: WalletSelectorVariant;
  onEthAddWalletSuccess?: () => void;
  onTezosAddWalletSuccess?: () => void;
};

export default function WalletSelector({
  queryRef,
  connectionMode = AUTH,
  variant,
  onEthAddWalletSuccess,
  onTezosAddWalletSuccess,
}: Props) {
  // Usually we'd want to pass in a query variable and use @skip to conditionally
  // return certain data fragments, but in this case, we have lots of queries that
  // bundle this fragment and the two branches won't differ enough to be concerning
  // so we're using both for now.
  const query = useFragment(
    graphql`
      fragment WalletSelectorFragment on Query {
        ...MultichainWalletSelectorFragment
      }
    `,
    queryRef
  );

  return (
    <MultichainWalletSelector
      connectionMode={connectionMode}
      queryRef={query}
      variant={variant}
      onEthAddWalletSuccess={onEthAddWalletSuccess}
      onTezosAddWalletSuccess={onTezosAddWalletSuccess}
    />
  );
}
