import { ADD_WALLET_TO_USER, AUTH, CONNECT_WALLET_ONLY } from 'types/Wallet';
import { graphql, useFragment } from 'react-relay';
import { WalletSelectorFragment$key } from '__generated__/WalletSelectorFragment.graphql';
import { MultichainWalletSelector } from './multichain/MultichainWalletSelector';
import EthereumWalletSelector from './EthereumWalletSelector';

// AUTH: authenticate with wallet (sign in)
// ADD_WALLET_TO_USER: add wallet to user
// CONNECT_WALLET: simple connect (no sign in) used to allow non-users to mint

export type ConnectionMode = typeof AUTH | typeof ADD_WALLET_TO_USER | typeof CONNECT_WALLET_ONLY;

type Props = {
  connectionMode?: ConnectionMode;
  queryRef: WalletSelectorFragment$key;
};

export default function WalletSelector({ connectionMode = AUTH, queryRef }: Props) {
  // Our feature flags are semi-global flags and I want to be able to toggle
  // this new multichain behavior on a per-user basis, to not block anyone if
  // authentication breaks while I am working on the new stuff. Anyone can opt
  // into it by setting the localStorage variable below.
  const isMultichain =
    typeof window !== 'undefined' &&
    !!window.localStorage.getItem('GALLERY_ENABLE_MULTICHAIN_AUTH');

  // Usually we'd want to pass in a query variable and use @skip to conditionally
  // return certain data fragments, but in this case, we have lots of queries that
  // bundle this fragment and the two branches won't differ enough to be concerning
  // so we're using both for now.
  const query = useFragment(
    graphql`
      fragment WalletSelectorFragment on Query {
        ...EthereumWalletSelectorFragment
        ...MultichainWalletSelectorFragment
      }
    `,
    queryRef
  );

  return isMultichain ? (
    <MultichainWalletSelector connectionMode={connectionMode} queryRef={query} />
  ) : (
    <EthereumWalletSelector connectionMode={connectionMode} queryRef={query} />
  );
}
