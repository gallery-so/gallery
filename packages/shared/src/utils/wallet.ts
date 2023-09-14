// map WalletName symbol description to user friendly name
import { graphql, readInlineData } from 'relay-runtime';

import { walletGetExternalAddressLinkFragment$key } from '~/generated/walletGetExternalAddressLinkFragment.graphql';
import { walletTruncateAddressFragment$key } from '~/generated/walletTruncateAddressFragment.graphql';
import { walletTruncateUniversalUsernameFragment$key } from '~/generated/walletTruncateUniversalUsernameFragment.graphql';

import { ETH_ADDRESS } from './regex';

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
  return `${address.slice(0, 8)}...${address.slice(-4)}`;
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
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  } else {
    return `${address.slice(0, 8)}...${address.slice(-4)}`;
  }
}

export function graphqlTruncateUniversalUsername(
  chainAddressRef: walletTruncateUniversalUsernameFragment$key
) {
  const { username, universal } = readInlineData(
    graphql`
      fragment walletTruncateUniversalUsernameFragment on GalleryUser @inline {
        username
        universal
      }
    `,
    chainAddressRef
  );

  if (!username || !universal) {
    // If there's any bad data, we'll try to
    // use the address raw. Might be null.
    return username;
  }

  // Might need to support .tez addresses in the future
  const isEns = username.includes('.eth');

  if (universal && !isEns) {
    return `${username.slice(0, 5)}....${username.slice(-2)}`;
  } else {
    return username;
  }
}

export function getExternalAddressLink(chainAddressRef: walletGetExternalAddressLinkFragment$key) {
  const { chain, address } = readInlineData(
    graphql`
      fragment walletGetExternalAddressLinkFragment on ChainAddress @inline {
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

  if (chain === 'Ethereum') {
    return `https://etherscan.io/address/${address}`;
  } else if (chain === 'Tezos') {
    return `https://tzkt.io/${address}/operations`;
  } else if (chain === 'Optimism') {
    return `https://optimistic.etherscan.io/address/${address}`;
  } else if (chain === 'Zora') {
    return `https://explorer.zora.energy/address/${address}`;
  } else if (chain === 'Polygon') {
    return `https://polygonscan.com/address/${address}`;
  }

  return null;
}

export function isValidEthereumAddress(address: string): boolean {
  const pattern = ETH_ADDRESS;
  return pattern.test(address);
}
