
const overrides: Record<string, string> = {
  WalletLink: 'Coinbase Wallet',
  GnosisSafe: 'Gnosis Safe',
};

// Convert wallet provider name to user friendly name
export function convertWalletName(name: string) {
  if (name in overrides) {
    return overrides[name];
  }

  return name;
}

export function truncateAddress(address: string) {
  return `${address.slice(0, 8)}......${address.slice(-4)}`;
}
