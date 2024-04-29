import { useRouter } from 'next/router';
import {
  EoaPayloadVariables,
  NeynarPayloadVariables,
  PrivyPayloadVariables,
} from 'shared/hooks/useAuthPayloadQuery';

export type AuthPayloadVariables =
  | EoaPayloadVariables
  | NeynarPayloadVariables
  | PrivyPayloadVariables;

export function isEoaPayload(payload: AuthPayloadVariables): payload is EoaPayloadVariables {
  return payload.authMechanismType === 'eoa';
}

export default function useAuthPayloadQuery(): AuthPayloadVariables | null {
  const { query } = useRouter();

  // convert this to privy
  if (query.authMechanismType === 'privy') {
    if (typeof query.token !== 'string' || typeof query.email !== 'string') {
      return null;
    }
    return {
      authMechanismType: 'privy',
      privyToken: query.token as string,
      email: query.email as string,
      userFriendlyWalletName: 'Privy',
    };
  }

  // need weird typechecking logic in this func due to the fact that nextjs queries can be
  // a variety of types, and doesn't offer generics
  if (
    typeof query.authMechanismType !== 'string' ||
    typeof query.address !== 'string' ||
    typeof query.nonce !== 'string' ||
    typeof query.message !== 'string' ||
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
      message: query.message,
      signature: query.signature,
      userFriendlyWalletName: query.userFriendlyWalletName || 'unknown',
      email: (query.email as string) || undefined,
    };
  }

  if (query.authMechanismType === 'neynar') {
    if (typeof query.primaryAddress !== 'string') {
      return null;
    }
    return {
      authMechanismType: 'neynar',
      nonce: query.nonce,
      message: query.message,
      signature: query.signature,
      address: query.address,
      primaryAddress: query.primaryAddress,
      email: typeof query.email === 'string' ? query.email : undefined,
    };
  }

  return null;

  // gnosis safe killed for now
  // return {
  //   authMechanismType: 'gnosisSafe',
  //   address: query.address,
  //   nonce: query.nonce,
  //   message: query.message,
  //   signature: query.signature,
  //   userFriendlyWalletName: query.userFriendlyWalletName || 'unknown',
  // };
}
