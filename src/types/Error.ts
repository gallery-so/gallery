export type ErrorCode = string;
export type Web3Error = Error & { code: ErrorCode };

export function isWeb3Error(error: any): error is Web3Error {
  return typeof error === 'object' && error !== null && 'code' in error;
}
