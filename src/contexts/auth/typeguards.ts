import { AuthState } from './AuthContext';
import { LOADING, LoggedInState } from './types';

export function isLoggedInState(state: AuthState): state is LoggedInState {
  return typeof state === 'object' && state !== null && 'jwt' in state;
}

export function isLoadingState(state: AuthState) {
  return state === LOADING;
}

