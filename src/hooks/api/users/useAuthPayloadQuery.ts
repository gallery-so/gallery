import { useRouter } from 'next/router';

export type AuthPayloadVariables = {
  chain: 'Ethereum';
  address: string;
  nonce: string;
  signature: string;
  userFriendlyWalletName: string;
};

export default function useAuthPayloadQuery(): AuthPayloadVariables | null {
  const { query } = useRouter();

  if (
    typeof query.address !== 'string' ||
    typeof query.nonce !== 'string' ||
    typeof query.signature !== 'string' ||
    Array.isArray(query.userFriendlyWalletName)
  ) {
    return null;
  }

  return {
    chain: 'Ethereum',
    address: query.address,
    nonce: query.nonce,
    signature: query.signature,
    userFriendlyWalletName: query.userFriendlyWalletName || 'unknown',
  };
}
