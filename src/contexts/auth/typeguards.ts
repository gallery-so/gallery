import { AuthState } from './AuthContext';
import { LOADING, LoggedInState, LOGGED_IN } from './types';

export function isLoggedInState(state: AuthState): state is LoggedInState {
  return state === LOGGED_IN;
}

export function isLoadingState(state: AuthState) {
  return state === LOADING;
}
