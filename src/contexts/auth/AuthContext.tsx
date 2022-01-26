import usePersistedState from 'hooks/usePersistedState';
import {
  ReactNode,
  createContext,
  useContext,
  memo,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { _fetch } from 'contexts/swr/useFetcher';
import Web3WalletProvider from './Web3WalletContext';
import { LOADING, LoggedInState, LOGGED_IN, LOGGED_OUT, UNKNOWN } from './types';
import clearLocalStorageWithException from './clearLocalStorageWithException';
import { useCurrentUser } from 'hooks/api/users/useUser';
import useLogout from 'hooks/api/auth/useLogout';
import { USER_SIGNIN_ADDRESS_LOCAL_STORAGE_KEY } from 'constants/storageKeys';

export type AuthState =
  | LoggedInState
  | typeof LOGGED_IN
  | typeof LOGGED_OUT
  | typeof LOADING
  | typeof UNKNOWN;

const AuthStateContext = createContext<AuthState>(UNKNOWN);

export const useAuthState = (): AuthState => {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw new Error('Attempted to use AuthStateContext without a provider!');
  }

  return context;
};

type AuthActions = {
  logIn: (address: string) => void;
  logOut: () => void;
  setStateToLoading: () => void;
};

const AuthActionsContext = createContext<AuthActions | undefined>(undefined);

export const useAuthActions = (): AuthActions => {
  const context = useContext(AuthActionsContext);
  if (!context) {
    throw new Error('Attempted to use AuthActionsContext without a provider!');
  }

  return context;
};

type Props = { children: ReactNode };

const AuthProvider = memo(({ children }: Props) => {
  const [authState, setAuthState] = useState<AuthState>(UNKNOWN);
  const [userSigninAddress, setUserSigninAddress] = usePersistedState(
    USER_SIGNIN_ADDRESS_LOCAL_STORAGE_KEY,
    ''
  );

  const callLogout = useLogout();

  /**
   * Sets the user state to logged out and clears local storage
   */
  const setLoggedOut = useCallback(() => {
    setAuthState(LOGGED_OUT);
    setUserSigninAddress('');
    /**
     * NOTE: clearing localStorage completely will also clear the SWR cache, which
     * will require users to re-fetch data if they visit a profile they've already
     * visited (including their own). In the future, we should clear data more
     * selectively (such as only sensitive data)
     */
    clearLocalStorageWithException([]);
  }, [setUserSigninAddress]);

  /**
   * Fully logs user out by calling the logout endpoint and logging out in app state
   */
  const logOut = useCallback(async () => {
    await callLogout();
    setLoggedOut();
  }, [callLogout, setLoggedOut]);

  const logIn = useCallback(
    async (address: string) => {
      try {
        setAuthState(LOGGED_IN);
        setUserSigninAddress(address.toLowerCase());
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setLoggedOut();
        throw new Error('Authorization failed! ' + errorMessage);
      }
    },
    [setLoggedOut, setUserSigninAddress]
  );

  const setStateToLoading = useCallback(() => {
    setAuthState(LOADING);
  }, []);

  useEffect(() => {
    async function getCurrentUser() {
      try {
        await _fetch('/users/get/current', 'get current user');
        setAuthState(LOGGED_IN);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error: unknown) {
        setAuthState(LOGGED_OUT);
      }
    }

    void getCurrentUser();
  }, []);

  const authActions: AuthActions = useMemo(
    () => ({ logIn, logOut, setStateToLoading }),
    [logIn, logOut, setStateToLoading]
  );

  const shouldDisplayUniversalLoader = useMemo(
    () => authState === UNKNOWN || authState === LOADING,
    [authState]
  );

  // TODO: display a loader instead of `null`
  return shouldDisplayUniversalLoader ? null : (
    <AuthStateContext.Provider value={authState}>
      <AuthActionsContext.Provider value={authActions}>
        <Web3WalletProvider>{children}</Web3WalletProvider>
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
});

export default AuthProvider;
