import { AuthState } from './AuthContext';
import { LOADING, LOGGED_IN } from './types';

export function isLoggedInState(state: AuthState): state is LOGGED_IN {
  return (
    typeof state === 'object' && state !== null && 'type' in state && state.type === 'LOGGED_IN'
  );
}

export function isLoadingState(state: AuthState) {
  return state === LOADING;
}
