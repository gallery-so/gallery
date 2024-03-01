import { useRouter } from 'next/router';

type EoaPayloadVariables = {
  authMechanismType: 'eoa' | 'gnosisSafe';
  chain: 'Ethereum' | 'Tezos';
  address: string;
  nonce: string;
  signature: string;
  userFriendlyWalletName: string;
  email?: string;
};

type GnosisPayloadVariables = {
  authMechanismType: 'eoa' | 'gnosisSafe';
  address: string;
  nonce: string;
  userFriendlyWalletName: string;
  email?: string;
};

type MagicLinkPayloadVariables = {
  authMechanismType: 'magicLink';
  token: string;
  userFriendlyWalletName: string;
};

export type AuthPayloadVariables =
  | EoaPayloadVariables
  | GnosisPayloadVariables
  | MagicLinkPayloadVariables;

export function isEoaPayload(payload: AuthPayloadVariables): payload is EoaPayloadVariables {
  return payload.authMechanismType === 'eoa';
}

export default function useAuthPayloadQuery(): AuthPayloadVariables | null {
  const { query } = useRouter();

  if (query.authMechanismType === 'magicLink') {
    return {
      authMechanismType: 'magicLink',
      token: query.token as string,
      userFriendlyWalletName: (query.userFriendlyWalletName as string) || 'unknown',
    };
  }

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

  if (typeof query.signature !== 'string') {
    return null;
  }

  if (query.authMechanismType === 'eoa') {
    return {
      authMechanismType: 'eoa',
      chain: query.chain as EoaPayloadVariables['chain'],
      address: query.address,
      nonce: query.nonce,
      signature: query.signature,
      userFriendlyWalletName: query.userFriendlyWalletName || 'unknown',
      email: (query.email as string) || undefined,
    };
  }

  return {
    authMechanismType: 'gnosisSafe',
    address: query.address,
    nonce: query.nonce,
    userFriendlyWalletName: query.userFriendlyWalletName || 'unknown',
  };
}
