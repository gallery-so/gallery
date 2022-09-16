// map WalletName symbol description to user friendly name
import { graphql, readInlineData } from 'relay-runtime';
import { walletTruncateAddressFragment$key } from '../../__generated__/walletTruncateAddressFragment.graphql';

const overrides: Record<string, string> = {
  METAMASK: 'MetaMask',
  WALLETCONNECT: 'WalletConnect',
  WALLETLINK: 'Coinbase Wallet',
  GNOSIS_SAFE: 'Gnosis Safe',
  ETHEREUM: 'Ethereum',
};

// Convert wallet provider name to user friendly name
export function getUserFriendlyWalletName(name: string) {
  if (name in overrides) {
    return overrides[name];
  }

  return name;
}

export function truncateAddress(address: string) {
  return `${address.slice(0, 8)}......${address.slice(-4)}`;
}

export function graphqlTruncateAddress(chainAddressRef: walletTruncateAddressFragment$key) {
  const { chain, address } = readInlineData(
    graphql`
      fragment walletTruncateAddressFragment on ChainAddress @inline {
        chain
        address
      }
    `,
    chainAddressRef
  );

  if (!chain || !address) {
    // If there's any bad data, we'll try to
    // use the address raw. Might be null.
    return address;
  }

  if (chain === 'Tezos') {
    return `${address.slice(0, 6)}....${address.slice(-6)}`;
  } else {
    return `${address.slice(0, 8)}...${address.slice(-4)}`;
  }
}
