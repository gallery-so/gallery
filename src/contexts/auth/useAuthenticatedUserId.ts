import { useAuthState } from './AuthContext';
import { isLoggedInState } from './typeguards';

export default function useAuthenticatedUserId(): string | undefined {
  const authState = useAuthState();
  const isLoggedIn = isLoggedInState(authState);
  if (isLoggedIn) {
    return authState.userId;
  }

  return undefined;
}
