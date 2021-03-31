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

type LoggedIn = { jwt: string };
type AuthState = LoggedIn | 'LOGGED_OUT' | 'LOADING' | 'UNKNOWN';

const AuthStateContext = createContext<AuthState>('UNKNOWN');

export const useAuthState = (): AuthState => {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw Error('Attempted to use AuthStateContext without a provider!');
  }
  return context;
};

type AuthActions = {
  logIn: (jwt: LoggedIn['jwt']) => void;
  logOut: () => void;
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
  const [authState, setAuthState] = useState<AuthState>('UNKNOWN');
  const [token, setToken] = usePersistedState('jwt', '');

  const logOut = useCallback(() => {
    localStorage.clear();
    setAuthState('LOGGED_OUT');
    setToken('');
  }, [setToken]);

  const logIn = useCallback(
    async (jwt: LoggedIn['jwt']) => {
      try {
        // const refreshedJwt = await validateAndRefreshJwt(jwt);
        setToken(jwt);
        setAuthState({ jwt });
      } catch (e) {
        logOut();
        throw new Error('Authorization failed! ' + e.message);
      }
    },
    [logOut, setToken]
  );

  useEffect(
    function authProviderMounted() {
      async function loadAuthState() {
        // show user loading screen while we figure out whether they are logged in or not
        setAuthState('LOADING');

        if (token) {
          logIn(token);
          return;
        }
        logOut();
      }
      if (authState === 'UNKNOWN') {
        loadAuthState();
      }
    },
    [authState, logIn, logOut, token]
  );

  const authActions: AuthActions = useMemo(() => ({ logIn, logOut }), [
    logIn,
    logOut,
  ]);

  const isLoadingOrUnknown = useMemo(() => {
    return authState === 'UNKNOWN' || authState === 'LOADING';
  }, [authState]);

  // TODO: add Loading component
  return isLoadingOrUnknown ? null : (
    <AuthStateContext.Provider value={authState}>
      <AuthActionsContext.Provider value={authActions}>
        <Web3WalletProvider>{children}</Web3WalletProvider>
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
});

export default AuthProvider;
