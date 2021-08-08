import { genericErrorMessage } from './constants';

export default function formatError(e: Error) {
  return e.message ? `Error: ${e.message}` : genericErrorMessage;
}
