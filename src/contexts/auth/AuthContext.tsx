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
  Fragment,
  Suspense,
} from 'react';
import Web3WalletProvider from './Web3WalletContext';
import { LOGGED_IN, LOGGED_OUT, UNKNOWN } from './types';
import clearLocalStorageWithException from './clearLocalStorageWithException';
import { USER_SIGNIN_ADDRESS_LOCAL_STORAGE_KEY } from 'constants/storageKeys';
import { useToastActions } from 'contexts/toast/ToastContext';
import { _identify } from 'contexts/analytics/AnalyticsContext';
import { fetchQuery, graphql, useRelayEnvironment } from 'react-relay';
import { AuthContextFetchUserQuery } from '__generated__/AuthContextFetchUserQuery.graphql';
import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { AuthContextLogoutMutation } from '__generated__/AuthContextLogoutMutation.graphql';
import ErrorBoundary from 'contexts/boundary/ErrorBoundary';
import Loader from 'components/core/Loader/Loader';
import { getCurrentHub, startTransaction } from '@sentry/nextjs';

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

const useImperativelyFetchUser = () => {
  const relayEnvironment = useRelayEnvironment();

  return useCallback(async () => {
    return await fetchQuery<AuthContextFetchUserQuery>(
      relayEnvironment,
      graphql`
        query AuthContextFetchUserQuery {
          viewer {
            ... on Viewer {
              __typename
              user {
                id
                dbid
                username
              }
            }
            ... on ErrNotAuthorized {
              __typename
              cause {
                ... on ErrInvalidToken {
                  __typename
                }
              }
            }
          }
        }
      `,
      {}
    ).toPromise();
  }, [relayEnvironment]);
};

const useLogout = () => {
  const [logout] = usePromisifiedMutation<AuthContextLogoutMutation>(
    graphql`
      mutation AuthContextLogoutMutation {
        logout {
          viewer {
            __typename
            user {
              username
            }
          }
        }
      }
    `
  );

  return useCallback(() => {
    logout({
      variables: {},
      updater: (store) => {
        // TODO: manually dropping the viewer on logout for now.
        // for some reason the mutation that returns Viewer => user
        // doesn't update the store as expected, and the Viewer
        // remains in our cache...
        store.delete('client:root:viewer');
      },
    });
  }, [logout]);
};

type Props = { children: ReactNode };

const AuthProvider = memo(({ children }: Props) => {
  const [authState, setAuthState] = useState<AuthState>(UNKNOWN);

  // we store what wallet they've logged in with on metamask / etc.,
  // which is necessary for the Manage Wallets view
  const [, setLocallyLoggedInWalletAddress] = usePersistedState(
    USER_SIGNIN_ADDRESS_LOCAL_STORAGE_KEY,
    ''
  );

  /**
   * Sets the user state to logged out and clears local storage
   */
  const setLoggedOut = useCallback(() => {
    setAuthState(LOGGED_OUT);
    setLocallyLoggedInWalletAddress('');
    clearLocalStorageWithException([]);
  }, [setLocallyLoggedInWalletAddress]);

  const logoutOnServer = useLogout();

  /**
   * Fully logs user out by calling the logout endpoint and logging out in app state
   */
  const handleLogout = useCallback(() => {
    logoutOnServer();
    setLoggedOut();
  }, [setLoggedOut, logoutOnServer]);

  const { pushToast } = useToastActions();

  const handleUnauthorized = useCallback(() => {
    pushToast(EXPIRED_SESSION_MESSAGE);
    setLoggedOut();
  }, [pushToast, setLoggedOut]);

  const imperativelyFetchUser = useImperativelyFetchUser();

  const handleLogin = useCallback(
    async (userId: string, address: string) => {
      try {
        const transaction = startTransaction({ name: 'imperativelyFetchUser', op: 'login' });
        getCurrentHub().configureScope((scope) => scope.setSpan(transaction));

        const response = await imperativelyFetchUser();

        if (response?.viewer?.__typename === 'Viewer' && response.viewer.user?.dbid) {
          setAuthState({ type: 'LOGGED_IN', userId });
          setLocallyLoggedInWalletAddress(address.toLowerCase());
          _identify(userId);
        }

        if (
          response?.viewer?.__typename === 'ErrNotAuthorized' &&
          response.viewer.cause.__typename === 'ErrInvalidToken'
        ) {
          pushToast(EXPIRED_SESSION_MESSAGE);
        }

        transaction.finish();
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setLoggedOut();
        throw new Error('Authorization failed! ' + errorMessage);
      }
    },
    [imperativelyFetchUser, pushToast, setLocallyLoggedInWalletAddress, setLoggedOut]
  );

  // this effect runs on mount to determine whether or not to display
  // a logged in vs. logged out experience. in the future, this logic
  // could theoretically be handled by each child component, rather
  // than within this context.
  useEffect(() => {
    async function fetchAuthenticatedUser() {
      try {
        const response = await imperativelyFetchUser();

        if (response?.viewer?.__typename === 'Viewer' && response.viewer.user?.dbid) {
          const userId = response.viewer.user.dbid;
          setAuthState({ type: 'LOGGED_IN', userId: userId });
          _identify(userId);
          return;
        }

        if (
          response?.viewer?.__typename === 'ErrNotAuthorized' &&
          response.viewer.cause.__typename === 'ErrInvalidToken'
        ) {
          pushToast(EXPIRED_SESSION_MESSAGE);
        }

        setAuthState(LOGGED_OUT);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error: unknown) {
        // we can ignore errors when fetching the current user, since
        // it just means we should give them the logged-out experience
        setAuthState(LOGGED_OUT);
      }
    }

    if (authState === UNKNOWN) {
      void fetchAuthenticatedUser();
    }
  }, [authState, imperativelyFetchUser, pushToast]);

  const authActions: AuthActions = useMemo(
    () => ({ handleUnauthorized, handleLogin, handleLogout }),
    [handleUnauthorized, handleLogin, handleLogout]
  );

  const shouldDisplayUniversalLoader = useMemo(() => authState === UNKNOWN, [authState]);

  return (
    <Fragment key={shouldDisplayUniversalLoader.toString()}>
      <div style={{ display: shouldDisplayUniversalLoader ? 'none' : undefined }}>
        <ErrorBoundary>
          <Suspense fallback={<Loader />}>
            <AuthStateContext.Provider value={authState}>
              <AuthActionsContext.Provider value={authActions}>
                <Web3WalletProvider>{children}</Web3WalletProvider>
              </AuthActionsContext.Provider>
            </AuthStateContext.Provider>
          </Suspense>
        </ErrorBoundary>
      </div>
    </Fragment>
  );
});

export default AuthProvider;
