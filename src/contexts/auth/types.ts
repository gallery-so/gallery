import { AuthState } from './AuthContext';

export function isLoggedInState(state: AuthState) {
  return typeof state === 'object';
}
