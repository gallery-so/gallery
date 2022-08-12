// map WalletName symbol description to user friendly name
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
