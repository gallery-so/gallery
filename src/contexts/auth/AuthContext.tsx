import { getCurrentHub, startTransaction } from '@sentry/nextjs';
import {
  createContext,
  Fragment,
  memo,
  ReactNode,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { fetchQuery, graphql, useRelayEnvironment } from 'react-relay';

import FullPageLoader from '~/components/core/Loader/FullPageLoader';
import {
  GLOBAL_BANNER_STORAGE_KEY,
  TEZOS_ANNOUNCEMENT_STORAGE_KEY,
  USER_SIGNIN_ADDRESS_LOCAL_STORAGE_KEY,
} from '~/constants/storageKeys';
import { _identify } from '~/contexts/analytics/AnalyticsContext';
import ErrorBoundary from '~/contexts/boundary/ErrorBoundary';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { AuthContextFetchUserQuery } from '~/generated/AuthContextFetchUserQuery.graphql';
import { AuthContextLogoutMutation } from '~/generated/AuthContextLogoutMutation.graphql';
import usePersistedState from '~/hooks/usePersistedState';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';
import { isWeb3Error, Web3Error } from '~/types/Error';

import clearLocalStorageWithException from './clearLocalStorageWithException';
import { EtheremProviders } from './EthereumProviders';
import { LOGGED_IN, LOGGED_OUT, UNKNOWN } from './types';
import Web3WalletProvider from './Web3WalletContext';

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
                wallets {
                  dbid
                  chainAddress {
                    chain
                    address
                  }
                }
              }
            }
            ... on ErrNotAuthorized {
              __typename
              cause {
                ... on ErrInvalidToken {
                  __typename
                }
                ... on ErrDoesNotOwnRequiredToken {
                  __typename
                }
                ... on ErrNoCookie {
                  __typename
                }
              }
            }
          }

          ...ProfileDropdownFragment
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

  return useCallback(async () => {
    await logout({
      variables: {},
    });

    // Need to do this for now.
    // Steps to reproduce
    // 1. Visit Home page logged in
    // 2. Load worldwide tab
    // 3. Select following tab
    // 4. log out.
    // See bug
    //
    // This happens because the worldwide tab is reloading and using a cached
    // response which has the old viewer inside. This is a fucking disaster
    location.reload();
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
    // keep around dismissed state of banner so that user doesn't
    // encounter it again on login
    clearLocalStorageWithException([GLOBAL_BANNER_STORAGE_KEY, TEZOS_ANNOUNCEMENT_STORAGE_KEY]);
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
    pushToast({ message: EXPIRED_SESSION_MESSAGE });
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
          pushToast({ message: EXPIRED_SESSION_MESSAGE });
        }

        if (
          response?.viewer?.__typename === 'ErrNotAuthorized' &&
          response.viewer.cause.__typename === 'ErrDoesNotOwnRequiredToken'
        ) {
          const errorWithCode: Web3Error = {
            name: 'ErrNotAuthorized',
            code: 'GALLERY_SERVER_ERROR',
            message: 'required tokens not owned',
          };

          throw errorWithCode;
        }

        if (
          response?.viewer?.__typename === 'ErrNotAuthorized' &&
          response.viewer.cause.__typename === 'ErrNoCookie'
        ) {
          const errorWithCode: Web3Error = {
            name: 'ErrNotAuthorized',
            code: 'NO_COOKIE',
            message: 'cookie not set from login',
          };

          throw errorWithCode;
        }

        transaction.finish();
      } catch (error: unknown) {
        if (isWeb3Error(error)) {
          throw error;
        }
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
          pushToast({ message: EXPIRED_SESSION_MESSAGE });
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
      <ErrorBoundary>
        <Suspense fallback={<FullPageLoader />}>
          <AuthStateContext.Provider value={authState}>
            <AuthActionsContext.Provider value={authActions}>
              <EtheremProviders>
                <Web3WalletProvider>
                  {shouldDisplayUniversalLoader ? null : children}
                </Web3WalletProvider>
              </EtheremProviders>
            </AuthActionsContext.Provider>
          </AuthStateContext.Provider>
        </Suspense>
      </ErrorBoundary>
    </Fragment>
  );
});

AuthProvider.displayName = 'AuthProvider';

export default AuthProvider;
