import { useRouter } from 'next/router';

type EoaPayloadVariables = {
  authMechanismType: 'eoa' | 'gnosisSafe';
  chain: 'Ethereum' | 'Tezos';
  address: string;
  nonce: string;
  signature: string;
  userFriendlyWalletName: string;
};

type GnosisPayloadVariables = {
  authMechanismType: 'eoa' | 'gnosisSafe';
  address: string;
  nonce: string;
  userFriendlyWalletName: string;
};

export type AuthPayloadVariables = EoaPayloadVariables | GnosisPayloadVariables;

export function isEoaPayload(payload: AuthPayloadVariables): payload is EoaPayloadVariables {
  return payload.authMechanismType === 'eoa';
}

export default function useAuthPayloadQuery(): AuthPayloadVariables | null {
  const { query } = useRouter();

  // need weird typechecking logic in this func due to the fact that nextjs queries can be
  // a variety of types, and doesn't offer generics
  if (
    typeof query.authMechanismType !== 'string' ||
    typeof query.address !== 'string' ||
    typeof query.nonce !== 'string' ||
    Array.isArray(query.userFriendlyWalletName)
  ) {
    return null;
  }

  if (query.authMechanismType === 'eoa') {
    if (typeof query.signature !== 'string') {
      return null;
    }

    return {
      authMechanismType: 'eoa',
      chain: query.chain as EoaPayloadVariables['chain'],
      address: query.address,
      nonce: query.nonce,
      signature: query.signature,
      userFriendlyWalletName: query.userFriendlyWalletName || 'unknown',
    };
  }

  return {
    authMechanismType: 'gnosisSafe',
    address: query.address,
    nonce: query.nonce,
    userFriendlyWalletName: query.userFriendlyWalletName || 'unknown',
  };
}
