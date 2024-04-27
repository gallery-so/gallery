import { addBreadcrumb } from '@sentry/react-native';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { graphql, useRelayEnvironment } from 'react-relay';
// @ts-expect-error We're in untyped territory
import { getFragmentResourceForEnvironment } from 'react-relay/lib/relay-hooks/FragmentResource';

import { TokenStateManagerContextRefreshMutation } from '~/generated/TokenStateManagerContextRefreshMutation.graphql';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import { StillLoadingNftError } from '~/shared/errors/StillLoadingNftError';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

import { useToastActions } from './ToastContext';

export type TokenState = {
  isFailed: boolean;
  isLoading: boolean;
  isPolling: boolean;
  retryKey: number;
  refreshingMetadata: boolean;
};

type TokenStateMap = Record<string, TokenState>;

type TokenStateManagerContextType = {
  tokens: TokenStateMap;
  markTokenAsLoaded: (tokenId: string) => void;
  markTokenAsPolling: (tokenId: string) => void;
  markTokenAsFailed: (tokenId: string, error: Error) => void;
  refreshToken: (tokenId: string) => Promise<void>;
  clearTokenFailureState: (tokenIds: string[]) => void;
  getTokenState: (tokenId: string) => TokenState | undefined;
};

const TokenStateManagerContext = createContext<TokenStateManagerContextType | undefined>(undefined);

export function useTokenStateManagerContext() {
  const value = useContext(TokenStateManagerContext);

  if (!value) {
    throw new Error('Tried to use TokenStateManagerContext without a Provider');
  }

  return value;
}

export function defaultTokenState(): TokenState {
  return {
    isFailed: false,
    isLoading: false,
    isPolling: false,
    retryKey: 0,
    refreshingMetadata: false,
  };
}

export function TokenStateManagerProvider({ children }: PropsWithChildren) {
  const reportError = useReportError();
  const { pushToast } = useToastActions();
  const [tokens, setTokens] = useState<TokenStateMap>(() => ({}));

  const markTokenAsLoaded = useCallback<TokenStateManagerContextType['markTokenAsLoaded']>(
    (tokenId: string) => {
      setTokens((previous) => {
        const next: TokenStateMap = { ...previous };
        delete next[tokenId];
        return next;
      });
    },
    []
  );

  const markTokenAsPolling = useCallback<TokenStateManagerContextType['markTokenAsPolling']>(
    (tokenId: string) => {
      setTokens((previous) => {
        const next: TokenStateMap = { ...previous };
        const token = { ...(next[tokenId] ?? defaultTokenState()) };
        next[tokenId] = { ...token, isPolling: true };
        return next;
      });
    },
    []
  );

  const markTokenAsFailed = useCallback<TokenStateManagerContextType['markTokenAsFailed']>(
    (tokenId: string, error: Error) => {
      setTokens((previous) => {
        const next = { ...previous };
        const token = { ...(next[tokenId] ?? defaultTokenState()) };

        if (error instanceof StillLoadingNftError) {
          token.isLoading = true;
        } else {
          addBreadcrumb({ category: 'nft error', message: error.message, level: 'error' });
          token.isFailed = true;
        }

        next[tokenId] = token;

        return next;
      });
    },
    []
  );

  const [refresh] = usePromisifiedMutation<TokenStateManagerContextRefreshMutation>(graphql`
    mutation TokenStateManagerContextRefreshMutation($tokenId: DBID!) {
      refreshToken(tokenId: $tokenId) {
        ... on RefreshTokenPayload {
          __typename
          token {
            # ensure we're reloading the necessary data.
            # there may be more i've forgotten!
            ...getPreviewImageUrlsInlineDangerouslyFragment
          }
        }
      }
    }
  `);

  const environment = useRelayEnvironment();
  const FragmentResource = getFragmentResourceForEnvironment(environment);
  const incrementTokenRetryKey = useCallback(
    (tokenIdentifiers: string | string[]) => {
      addBreadcrumb({
        message: 'Trying to clear the Relay FragmentResource cache',
        level: 'info',
      });

      const tokenIdsArray = Array.isArray(tokenIdentifiers) ? tokenIdentifiers : [tokenIdentifiers];

      try {
        FragmentResource._cache._map.clear();
      } catch (e) {
        if (e instanceof Error || typeof e === 'string') {
          reportError(e);
        }
      }

      setTokens((previous) => {
        const next = { ...previous };
        tokenIdsArray.forEach((tokenId) => {
          const token = { ...(next[tokenId] ?? defaultTokenState()) };
          token.isFailed = false;
          token.isLoading = false;
          token.isPolling = false;
          token.refreshingMetadata = false;
          token.retryKey++;
          next[tokenId] = token;
        });

        return next;
      });
    },
    [FragmentResource, reportError]
  );

  const refreshToken = useCallback<TokenStateManagerContextType['refreshToken']>(
    async (tokenId: string) => {
      function pushErrorToast() {
        pushToast({
          message:
            'There was an error while refreshing your piece. We have been notified and are looking into it.',
          autoClose: true,
        });
      }

      pushToast({
        message: "We're refreshing your token. This may take up to a few minutes.",
        autoClose: true,
      });

      try {
        setTokens((previous) => {
          const next: TokenStateMap = { ...previous };
          const token = next[tokenId];
          if (token) {
            next[tokenId] = { ...token, refreshingMetadata: true };
          }
          return next;
        });

        const response = await refresh({ variables: { tokenId } });

        if (response.refreshToken?.__typename === 'RefreshTokenPayload') {
          incrementTokenRetryKey(tokenId);
        } else {
          pushErrorToast();
          reportError('GraphQL Error while refreshing nft metadata', {
            tags: { tokenId, typename: response.refreshToken?.__typename },
          });
        }
      } catch (e) {
        reportError('GraphQL Error while refreshing nft metadata', {
          tags: { tokenId },
        });
        pushErrorToast();
      } finally {
        setTokens((previous) => {
          const next: TokenStateMap = { ...previous };
          const token = next[tokenId];
          if (token) {
            next[tokenId] = { ...token, refreshingMetadata: false };
          }
          return next;
        });
      }
    },
    [incrementTokenRetryKey, pushToast, refresh, reportError]
  );

  const clearTokenFailureState = useCallback<
    TokenStateManagerContextType['clearTokenFailureState']
  >(
    (tokenIds: string[]) => {
      incrementTokenRetryKey(tokenIds);
    },
    [incrementTokenRetryKey]
  );

  const getTokenState = useCallback(
    (tokenId: string) => {
      return tokens[tokenId];
    },
    [tokens]
  );

  const value = useMemo((): TokenStateManagerContextType => {
    return {
      tokens,
      markTokenAsLoaded,
      markTokenAsPolling,
      markTokenAsFailed,
      refreshToken,
      clearTokenFailureState,
      getTokenState,
    };
  }, [
    tokens,
    markTokenAsLoaded,
    markTokenAsPolling,
    markTokenAsFailed,
    refreshToken,
    clearTokenFailureState,
    getTokenState,
  ]);

  return (
    <TokenStateManagerContext.Provider value={value}>{children}</TokenStateManagerContext.Provider>
  );
}
