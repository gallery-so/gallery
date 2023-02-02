import { AuthState, useAuthState } from './AuthContext';
import { LOGGED_IN } from './types';

function isLoggedInState(state: AuthState): state is LOGGED_IN {
  return (
    typeof state === 'object' && state !== null && 'type' in state && state.type === 'LOGGED_IN'
  );
}

export default function useAuthenticatedUserId(): string | undefined {
  const authState = useAuthState();
  const isLoggedIn = isLoggedInState(authState);
  if (isLoggedIn) {
    return authState.userId;
  }

  return undefined;
}
