import { useAuthState } from './AuthContext';
import { isLoggedInState } from './types';

export default function useIsAuthenticated() {
  const authState = useAuthState();
  return isLoggedInState(authState);
}
