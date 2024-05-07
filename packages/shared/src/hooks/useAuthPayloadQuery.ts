export type SignerVariables = {
  address: string;
  nonce: string;
  message: string;
  signature: string;
};

export type EoaPayloadVariables = {
  authMechanismType: 'eoa' | 'gnosisSafe';
  chain: 'Ethereum' | 'Tezos';
  userFriendlyWalletName: string;
  email?: string;
  privyToken?: string;
} & SignerVariables;

export type GnosisPayloadVariables = {
  authMechanismType: 'eoa' | 'gnosisSafe';
  userFriendlyWalletName: string;
  email?: string;
  privyToken?: string;
} & SignerVariables;

export type PrivyPayloadVariables = {
  authMechanismType: 'privy';
  privyToken?: string;
  email?: string;
  userFriendlyWalletName?: string;
};

export type NeynarPayloadVariables = {
  authMechanismType: 'neynar';
  primaryAddress?: string;
  privyToken?: string;
  email?: string;
  userFriendlyWalletName?: string;
  farcasterUsername?: string;
} & SignerVariables;

export type AuthPayloadVariables =
  | EoaPayloadVariables
  | GnosisPayloadVariables
  | PrivyPayloadVariables
  | NeynarPayloadVariables;

export function isEoaPayload(payload: AuthPayloadVariables): payload is EoaPayloadVariables {
  return payload.authMechanismType === 'eoa';
}

export function isEmailPayload(payload: AuthPayloadVariables): payload is PrivyPayloadVariables {
  return payload.authMechanismType === 'privy';
}
