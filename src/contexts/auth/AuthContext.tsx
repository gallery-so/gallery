import Web3WalletProvider from './Web3WalletContext';
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
import { LoggedInState, LOADING, LOGGED_OUT, UNKNOWN } from './types';
import { JWT_LOCAL_STORAGE_KEY, USER_ID_LOCAL_STORAGE_KEY } from './constants';

export type AuthState =
  | LoggedInState
  | typeof LOGGED_OUT
  | typeof LOADING
  | typeof UNKNOWN;

const AuthStateContext = createContext<AuthState>(UNKNOWN);

export const useAuthState = (): AuthState => {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw Error('Attempted to use AuthStateContext without a provider!');
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
    throw Error('Attempted to use AuthActionsContext without a provider!');
  }
  return context;
};

type Props = { children: ReactNode };

const AuthProvider = memo(({ children }: Props) => {
  const [authState, setAuthState] = useState<AuthState>(UNKNOWN);
  const [token, setToken] = usePersistedState(JWT_LOCAL_STORAGE_KEY, '');
  const [userId, setUserId] = usePersistedState(USER_ID_LOCAL_STORAGE_KEY, '');

  const logOut = useCallback(() => {
    setAuthState(LOGGED_OUT);
    setToken('');
    setUserId('');
    /**
     * NOTE: clearing localStorage completely will also clear the SWR cache, which
     * will require users to re-fetch data if they visit a profile they've already
     * visited (including their own). In the future, we should clear data more
     * selectively (such as only sensitive data)
     */
    localStorage.clear();
  }, [setToken, setUserId]);

  const logIn = useCallback(
    async (payload: LoggedInState) => {
      try {
        // const refreshedJwt = await validateAndRefreshJwt(jwt);
        setToken(payload.jwt);
        setUserId(payload.userId);

        setAuthState(payload);
      } catch (e) {
        logOut();
        throw new Error('Authorization failed! ' + e.message);
      }
    },
    [logOut, setToken, setUserId]
  );

  const setStateToLoading = useCallback(() => {
    setAuthState(LOADING);
  }, []);

  useEffect(
    function authProviderMounted() {
      async function loadAuthState() {
        // show user loading screen while we figure out whether they are logged in or not
        setAuthState(LOADING);

        if (token && userId) {
          logIn({ jwt: token, userId });
          return;
        }
        logOut();
      }
      if (authState === UNKNOWN) {
        loadAuthState();
      }
    },
    [authState, logIn, logOut, token, userId]
  );

  const authActions: AuthActions = useMemo(
    () => ({ logIn, logOut, setStateToLoading }),
    [logIn, logOut, setStateToLoading]
  );

  const isUnknown = useMemo(() => {
    return authState === UNKNOWN;
  }, [authState]);

  // TODO: add Loading
  return isUnknown ? null : (
    <AuthStateContext.Provider value={authState}>
      <AuthActionsContext.Provider value={authActions}>
        <Web3WalletProvider>{children}</Web3WalletProvider>
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
});

export default AuthProvider;
