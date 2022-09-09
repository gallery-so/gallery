import { BeaconErrorType } from '@airgap/beacon-types';
import { getErrorCode } from 'components/WalletSelector/multichain/tezos/tezosUtils';

export type ErrorCode = string;
export type Web3Error = Error & { code: ErrorCode; customMessage?: string };

export type BeaconError = {
  title: string;
  name: string;
  message: string;
  description: string;
  code: BeaconErrorType;
};

export function isWeb3Error(error: unknown): error is Web3Error {
  return typeof error === 'object' && error !== null && 'code' in error;
}

export function isBeaconError(error: unknown): error is BeaconError {
  const code = getErrorCode(error);

  return typeof error === 'object' && error !== null && code in BeaconErrorType;
}
