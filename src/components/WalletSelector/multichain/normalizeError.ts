import { isBeaconError, isWeb3Error, Web3Error } from 'types/Error';
import { getErrorCode } from './tezos/tezosUtils';

export const normalizeError = (error: unknown): Error | Web3Error => {
  if (error instanceof Error) {
    return error;
  }
  if (isWeb3Error(error)) {
    return error;
  }

  // Check tezos error
  if (isBeaconError(error)) {
    return { ...error, code: getErrorCode(error) };
  }

  return new Error(`Unexpected error: ${error}`);
};
