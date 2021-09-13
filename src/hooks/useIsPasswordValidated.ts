import { PASSWORD_LOCAL_STORAGE_KEY } from 'contexts/auth/constants';
import { validatePassword } from 'utils/password';
import usePersistedState from './usePersistedState';

export default function useIsPasswordValidated() {
  const [storedPassword] = usePersistedState<string | null>(PASSWORD_LOCAL_STORAGE_KEY, null);
  const isStoredPasswordValid = storedPassword ? validatePassword(storedPassword) : false;

  return isStoredPasswordValid;
}
