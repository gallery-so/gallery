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
import { LOADING, LOGGED_IN, LOGGED_OUT, UNKNOWN } from './types';
import clearLocalStorageWithException from './clearLocalStorageWithException';
import {
  USER_LOGGED_IN_LOCAL_STORAGE_KEY,
  USER_SIGNIN_ADDRESS_LOCAL_STORAGE_KEY,
} from 'constants/storageKeys';
import { useToastActions } from 'contexts/toast/ToastContext';

export type AuthState = typeof LOGGED_IN | typeof LOGGED_OUT | typeof LOADING | typeof UNKNOWN;

const EXPIRED_SESSION_MESSAGE = 'Your session has expired. Please sign in again.';
const AuthStateContext = createContext<AuthState>(UNKNOWN);

export const useAuthState = (): AuthState => {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw new Error('Attempted to use AuthStateContext without a provider!');
  }

  return context;
};

type AuthActions = {
  setLoggedIn: (address: string) => void;
  logOut: () => void;
  setStateToLoading: () => void;
  handleUnauthorized: () => void;
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
  const [, setUserSigninAddress] = usePersistedState(USER_SIGNIN_ADDRESS_LOCAL_STORAGE_KEY, '');
  const [isLoggedInLocally, setIsLoggedInLocally] = usePersistedState(
    USER_LOGGED_IN_LOCAL_STORAGE_KEY,
    false
  );

  const { pushToast } = useToastActions();

  /**
   * Sets the user state to logged out and clears local storage
   */
  const setLoggedOut = useCallback(
    (isUnauthorized = false) => {
      if (isUnauthorized) {
        pushToast(EXPIRED_SESSION_MESSAGE);
      }

      setAuthState(LOGGED_OUT);
      setUserSigninAddress('');
      /**
       * NOTE: clearing localStorage completely will also clear the SWR cache, which
       * will require users to re-fetch data if they visit a profile they've already
       * visited (including their own). In the future, we should clear data more
       * selectively (such as only sensitive data)
       */
      clearLocalStorageWithException([]);
    },
    [pushToast, setUserSigninAddress]
  );

  /**
   * Fully logs user out by calling the logout endpoint and logging out in app state
   */
  const logOut = useCallback(() => {
    void _fetch('/auth/logout', 'logout', { body: {} });
    setLoggedOut();
  }, [setLoggedOut]);

  const setLoggedIn = useCallback(
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

  const handleUnauthorized = useCallback(() => {
    setLoggedOut(true);
  }, [setLoggedOut]);

  useEffect(() => {
    async function getAuthenticatedUser() {
      try {
        const authenticatedUser = await _fetch('/users/get/current', 'get current user');

        if (authenticatedUser) {
          setAuthState(LOGGED_IN);
          setIsLoggedInLocally(true);
          return;
        }

        // if no authenticated user is returned but they were logged in previously, show a toast
        if (isLoggedInLocally) {
          pushToast(EXPIRED_SESSION_MESSAGE);
        }

        setAuthState(LOGGED_OUT);
        setIsLoggedInLocally(false);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_error: unknown) {
        setAuthState(LOGGED_OUT);
        setIsLoggedInLocally(false);
      }
    }

    if (authState === UNKNOWN) {
      void getAuthenticatedUser();
    }
  }, [authState, isLoggedInLocally, pushToast, setIsLoggedInLocally]);

  const authActions: AuthActions = useMemo(
    () => ({ handleUnauthorized, setLoggedIn, logOut, setStateToLoading }),
    [handleUnauthorized, setLoggedIn, logOut, setStateToLoading]
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
