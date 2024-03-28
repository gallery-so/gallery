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

type EmailPayloadVariables = {
  authMechanismType: 'magicLink';
  token: string;
};

export type AuthPayloadVariables =
  | EoaPayloadVariables
  | GnosisPayloadVariables
  | EmailPayloadVariables;

export function isEoaPayload(payload: AuthPayloadVariables): payload is EoaPayloadVariables {
  return payload.authMechanismType === 'eoa';
}

export function isEmailPayload(payload: AuthPayloadVariables): payload is EmailPayloadVariables {
  return payload.authMechanismType === 'magicLink';
}
