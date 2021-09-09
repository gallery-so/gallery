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
import { LoggedInState, LOADING, LOGGED_OUT, UNKNOWN } from './types';
import {
  JWT_LOCAL_STORAGE_KEY,
  PASSWORD_LOCAL_STORAGE_KEY,
  USER_ID_LOCAL_STORAGE_KEY,
} from './constants';
import clearLocalStorageWithException from './clearLocalStorageWithException';

export type AuthState =
  | LoggedInState
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
  logIn: (payload: LoggedInState) => void;
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

type ValidateJwtResponse = {
  valid: boolean;
  user_id: string;
};

const AuthProvider = memo(({ children }: Props) => {
  const [authState, setAuthState] = useState<AuthState>(UNKNOWN);
  const [token, setToken] = usePersistedState(JWT_LOCAL_STORAGE_KEY, '');
  const [userId, setUserId] = usePersistedState(USER_ID_LOCAL_STORAGE_KEY, '');

  /**
   * Only sets the user state to logged out.
   */
  const setLoggedOut = useCallback(() => {
    setAuthState(LOGGED_OUT);
  }, []);

  /**
   * Fully logs user out and clears storage.
   */
  const logOut = useCallback(() => {
    setLoggedOut();
    setToken('');
    setUserId('');
    /**
     * NOTE: clearing localStorage completely will also clear the SWR cache, which
     * will require users to re-fetch data if they visit a profile they've already
     * visited (including their own). In the future, we should clear data more
     * selectively (such as only sensitive data)
     */
    clearLocalStorageWithException([PASSWORD_LOCAL_STORAGE_KEY]);
  }, [setToken, setUserId, setLoggedOut]);

  const logIn = useCallback(
    async (payload: LoggedInState) => {
      try {
        setToken(payload.jwt);
        setUserId(payload.userId);
        setAuthState(payload);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logOut();
        throw new Error('Authorization failed! ' + errorMessage);
      }
    },
    [logOut, setToken, setUserId],
  );

  const setStateToLoading = useCallback(() => {
    setAuthState(LOADING);
  }, []);

  useEffect(
    function authProviderMounted() {
      async function loadAuthState() {
        // Show user loading screen while we figure out whether they are logged in or not
        setAuthState(LOADING);

        if (token && userId) {
          const response = await _fetch<ValidateJwtResponse>(
            '/auth/jwt_valid',
            'validate jwt',
          );
          if (!response.valid) {
            // TODO: set explicit error on higher-level error context to display in a toast
            console.error('invalid or expired JWT');
            logOut();
            return;
          }

          await logIn({ jwt: token, userId });
          return;
        }

        setLoggedOut();
      }

      if (authState === UNKNOWN) {
        loadAuthState();
      }
    },
    [authState, logIn, logOut, setLoggedOut, token, userId],
  );

  const authActions: AuthActions = useMemo(
    () => ({ logIn, logOut, setStateToLoading }),
    [logIn, logOut, setStateToLoading],
  );

  const shouldDisplayUniversalLoader = useMemo(() => authState === UNKNOWN || authState === LOADING, [authState]);

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
