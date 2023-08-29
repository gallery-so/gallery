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
