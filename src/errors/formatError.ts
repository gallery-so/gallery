import { genericErrorMessage } from './constants';
import { ApiError } from './types';

export function formatDetailedError(e: Error) {
  if (e instanceof ApiError) {
    return {
      header: `Error while trying to ${e.customMessage}`,
      description: e.message,
    };
  }
  if (e.message) {
    return {
      header: `Error: ${e.message}`,
      description: '',
    };
  }
  return {
    header: '',
    description: genericErrorMessage,
  };
}

export default function formatError(e: Error) {
  if (e instanceof ApiError) return e.customMessage;
  if (e.message) return `Error: ${e.message}`;
  return genericErrorMessage;
}
