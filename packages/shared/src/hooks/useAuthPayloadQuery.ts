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
