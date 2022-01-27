import { AuthState } from './AuthContext';
import { LOADING, LOGGED_IN } from './types';

export function isLoggedInState(state: AuthState) {
  return state === LOGGED_IN;
}

export function isLoadingState(state: AuthState) {
  return state === LOADING;
}
