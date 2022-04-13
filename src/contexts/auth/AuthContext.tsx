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
import { LOGGED_IN, LOGGED_OUT, UNKNOWN } from './types';
import clearLocalStorageWithException from './clearLocalStorageWithException';
import {
  USER_LOGGED_IN_LOCAL_STORAGE_KEY,
  USER_SIGNIN_ADDRESS_LOCAL_STORAGE_KEY,
} from 'constants/storageKeys';
import { useToastActions } from 'contexts/toast/ToastContext';
import { User } from 'types/User';
import { _identify } from 'contexts/analytics/AnalyticsContext';

export type AuthState = LOGGED_IN | typeof LOGGED_OUT | typeof UNKNOWN;

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
  handleLogin: (userId: string, address: string) => void;
  handleLogout: () => void;
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
  const setLoggedOut = useCallback(() => {
    setAuthState(LOGGED_OUT);
    setUserSigninAddress('');
    clearLocalStorageWithException([]);
  }, [setUserSigninAddress]);

  /**
   * Fully logs user out by calling the logout endpoint and logging out in app state
   */
  const handleLogout = useCallback(() => {
    void _fetch('/auth/logout', 'logout', { body: {} });
    setLoggedOut();
  }, [setLoggedOut]);

  const handleUnauthorized = useCallback(() => {
    pushToast(EXPIRED_SESSION_MESSAGE);
    setLoggedOut();
  }, [pushToast, setLoggedOut]);

  const handleLogin = useCallback(
    async (userId: string, address: string) => {
      try {
        setAuthState({ type: 'LOGGED_IN', userId });
        setUserSigninAddress(address.toLowerCase());
        _identify(userId);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setLoggedOut();
        throw new Error('Authorization failed! ' + errorMessage);
      }
    },
    [setLoggedOut, setUserSigninAddress]
  );

  useEffect(() => {
    async function getAuthenticatedUser() {
      try {
        const authenticatedUser = await _fetch<User>('/users/get/current', 'get current user');

        if (authenticatedUser) {
          setAuthState({ type: 'LOGGED_IN', userId: authenticatedUser.id });
          setIsLoggedInLocally(true);
          _identify(authenticatedUser.id);
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
    () => ({ handleUnauthorized, handleLogin, handleLogout }),
    [handleUnauthorized, handleLogin, handleLogout]
  );

  const shouldDisplayUniversalLoader = useMemo(() => authState === UNKNOWN, [authState]);

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
