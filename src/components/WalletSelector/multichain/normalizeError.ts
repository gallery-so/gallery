import { isWeb3Error, Web3Error } from 'types/Error';

export const normalizeError = (error: unknown): Error | Web3Error => {
  if (error instanceof Error) {
    return error;
  }
  if (isWeb3Error(error)) {
    return error;
  }
  return new Error(`Unexpected error: ${error}`);
};
