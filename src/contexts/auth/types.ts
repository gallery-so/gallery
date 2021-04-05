import { AuthState } from './AuthContext';

export const LOGGED_OUT = Symbol('LOGGED_OUT');
export const LOADING = Symbol('LOADING');
export const UNKNOWN = Symbol('UNKNOWN');

export function isLoggedInState(state: AuthState) {
  return typeof state === 'object';
}

export function isLoadingState(state: AuthState) {
  return state === LOADING;
}
