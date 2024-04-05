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
} & SignerVariables;

export type GnosisPayloadVariables = {
  authMechanismType: 'eoa' | 'gnosisSafe';
  userFriendlyWalletName: string;
  email?: string;
} & SignerVariables;

export type EmailPayloadVariables = {
  authMechanismType: 'privy';
  token?: string;
};

type DeprecatedWebEmailPayloadVariables = {
  authMechanismType: 'magicLink';
  token: string;
};

export type NeynarPayloadVariables = {
  authMechanismType: 'neynar';
  primaryAddress?: string;
} & SignerVariables;

export type AuthPayloadVariables =
  | EoaPayloadVariables
  | GnosisPayloadVariables
  | EmailPayloadVariables
  | DeprecatedWebEmailPayloadVariables
  | NeynarPayloadVariables;

export function isEoaPayload(payload: AuthPayloadVariables): payload is EoaPayloadVariables {
  return payload.authMechanismType === 'eoa';
}

export function isEmailPayload(payload: AuthPayloadVariables): payload is EmailPayloadVariables {
  return payload.authMechanismType === 'privy';
}
