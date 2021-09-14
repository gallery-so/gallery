import { useAuthState } from './AuthContext';
import { isLoggedInState } from './typeguards';

export default function useIsAuthenticated() {
  const authState = useAuthState();
  return isLoggedInState(authState);
}
