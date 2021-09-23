import { genericErrorMessage } from './constants';
import { ApiError } from './types';

export function formatDetailedError(error: Error) {
  if (error instanceof ApiError) {
    return {
      header: `Error while attempting to ${error.customMessage}`,
      description: error.message,
    };
  }

  if (error.message) {
    return {
      header: `Error: ${error.message}`,
      description: '',
    };
  }

  return {
    header: '',
    description: genericErrorMessage,
  };
}

export default function formatError(error: Error) {
  if (error instanceof ApiError) {
    return `Error while attempting to ${error.customMessage}: ${error.message}`;
  }

  if (error.message) {
    return `Error: ${error.message}`;
  }

  return genericErrorMessage;
}
