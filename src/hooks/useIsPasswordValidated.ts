import { validatePassword } from 'utils/password';
import usePersistedState from './usePersistedState';

export default function useIsPasswordValidated() {
  const [storedPassword] = usePersistedState('password', null);
  const isStoredPasswordValid =
    storedPassword && validatePassword(storedPassword);

  return isStoredPasswordValid;
}
