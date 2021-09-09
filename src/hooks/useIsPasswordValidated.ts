import { PASSWORD_LOCAL_STORAGE_KEY } from 'contexts/auth/constants';
import { validatePassword } from 'utils/password';
import usePersistedState from './usePersistedState';

export default function useIsPasswordValidated() {
  const [storedPassword] = usePersistedState(PASSWORD_LOCAL_STORAGE_KEY, null);
  const isStoredPasswordValid
    = storedPassword && validatePassword(storedPassword);

  return isStoredPasswordValid;
}
