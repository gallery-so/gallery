import { AuthState } from './AuthContext';

export type LoggedInState = { jwt: string; userId: string };
export const LOGGED_OUT = Symbol('LOGGED_OUT');
export const LOADING = Symbol('LOADING');
export const UNKNOWN = Symbol('UNKNOWN');

export function isLoggedInState(state: AuthState): state is LoggedInState {
  return typeof state === 'object' && state !== null && 'jwt' in state;
}

export function isLoadingState(state: AuthState) {
  return state === LOADING;
}
