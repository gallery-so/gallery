import { AuthState } from './AuthContext';

export type LoggedIn = { jwt: string };
export const LOGGED_OUT = Symbol('LOGGED_OUT');
export const LOADING = Symbol('LOADING');
export const UNKNOWN = Symbol('UNKNOWN');

export function isLoggedInState(state: AuthState) {
  return typeof state === 'object' && state !== null && 'jwt' in state;
}

export function isLoadingState(state: AuthState) {
  return state === LOADING;
}
