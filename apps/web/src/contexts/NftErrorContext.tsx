import { addBreadcrumb } from '@sentry/nextjs';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useRelayEnvironment } from 'react-relay';
// @ts-expect-error We're in untyped territory
import { getFragmentResourceForEnvironment } from 'react-relay/lib/relay-hooks/FragmentResource';
import { graphql } from 'relay-runtime';

import { useToastActions } from '~/contexts/toast/ToastContext';
import { NftErrorContextRetryMutation } from '~/generated/NftErrorContextRetryMutation.graphql';
import { useReportError } from '~/shared/contexts/ErrorReportingContext';
import { StillLoadingNftError } from '~/shared/errors/StillLoadingNftError';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

export type TokenErrorState = {
  isFailed: boolean;
  // whether the token is still syncing without a fallback
  isLoading: boolean;
  // whether the polling process has kicked off for a syncing token
  isPolling: boolean;
  retryKey: number;
  refreshed: boolean;
  refreshingMetadata: boolean;
};

type TokenErrorMap = Record<string, TokenErrorState>;

type NftErrorContextType = {
  tokens: TokenErrorMap;

  markTokenAsLoaded: (tokenId: string) => void;
  refreshToken: (tokenId: string) => Promise<void>;
  clearTokenFailureState: (tokenIds: string[]) => void;
  handleNftError: (tokenId: string, error: Error) => void;
  markTokenAsPolling: (tokenId: string) => void;
};

const NftErrorContext = createContext<NftErrorContextType | undefined>(undefined);

export function defaultTokenErrorState(): TokenErrorState {
  return {
    isFailed: false,
    isLoading: false,
    isPolling: false,
    retryKey: 0,
    refreshed: false,
    refreshingMetadata: false,
  };
}

export function NftErrorProvider({ children }: PropsWithChildren) {
  const reportError = useReportError();
  const { pushToast } = useToastActions();
  const [tokens, setTokens] = useState<TokenErrorMap>(() => ({}));

  const markTokenAsLoaded = useCallback<NftErrorContextType['markTokenAsLoaded']>(
    (tokenId: string) => {
      setTokens((previous) => {
        const next: TokenErrorMap = { ...previous };

        delete next[tokenId];

        return next;
      });
    },
    []
  );

  const handleNftError = useCallback<NftErrorContextType['handleNftError']>(
    (tokenId: string, error: Error) => {
      setTokens((previous) => {
        const next = { ...previous };

        const token = { ...(next[tokenId] ?? defaultTokenErrorState()) };

        if (error instanceof StillLoadingNftError) {
          console.log('still loading!');
          token.isLoading = true;
        } else {
          addBreadcrumb({ category: 'nft error', message: error.message, level: 'error' });
          token.isFailed = true;
          // If the user refreshed the metadata and there was another failure,
          // we'll show them a new toast telling them things failed to load,
          // and we're looking into the issue asap.
          if (token.refreshed) {
            // Commenting this out because it's being displayed even without the user explicitly
            // refreshing anything in the editor
            //
            // pushToast({
            //   message:
            //     'This piece has failed to load. This issue has been reported to the Gallery team.',
            //   autoClose: true,
            // });
          }
        }

        next[tokenId] = token;

        return next;
      });
    },
    []
  );

  const environment = useRelayEnvironment();
  const FragmentResource = getFragmentResourceForEnvironment(environment);
  const retryToken = useCallback(
    (tokenId: string) => {
      addBreadcrumb({
        message: 'Trying to clear the Relay FragmentResource cache',
        level: 'info',
      });

      // Wrapping this in a try catch since we have no idea
      // if Relay wil introduce a breaking change here.
      try {
        /**
         * WARNING: DO NOT COPY THIS CODE UNLESS YOU KNOW WHAT YOU ARE DOING
         *
         * There is a bug in Relay where fragments are not receiving updates
         * if an underlying object's typename changes.
         *
         * We should report this at some point [GAL-371]
         */
        FragmentResource._cache._map.clear();
      } catch (e) {
        if (e instanceof Error || typeof e === 'string') {
          reportError(e);
        }
      }

      setTokens((previous) => {
        const next = { ...previous };

        const token = { ...(next[tokenId] ?? defaultTokenErrorState()) };

        token.isFailed = false;
        token.refreshed = true;
        token.retryKey++;

        next[tokenId] = token;

        return next;
      });
    },
    // Make sure this dep is `FragmentResource`, this is all untyped
    // `FragmentResource._cache._map` might cause a HUGE ERROR
    [FragmentResource, reportError]
  );

  const clearTokenFailureState = useCallback(
    (tokenIds: string[]) => {
      for (const tokenId of tokenIds) {
        retryToken(tokenId);
      }
    },
    [retryToken]
  );

  const [refresh] = usePromisifiedMutation<NftErrorContextRetryMutation>(graphql`
    mutation NftErrorContextRetryMutation($tokenId: DBID!) {
      refreshToken(tokenId: $tokenId) {
        ... on RefreshTokenPayload {
          __typename
          token {
            # Ensure we're reloading the necessary data
            ...NftPreviewFragment
            ...SidebarNftIconPreviewAssetNew
            ...NftDetailAssetTokenFragment
            ...StagingAreaFragment
          }
        }
      }
    }
  `);

  const refreshToken = useCallback<NftErrorContextType['refreshToken']>(
    async (tokenId: string) => {
      function pushErrorToast() {
        pushToast({
          message:
            'There was an error while refreshing your piece. We have been notified and are looking into it.',
          autoClose: true,
        });
      }

      pushToast({
        message: 'This piece is loading. This may take up to a few minutes.',
        autoClose: true,
      });

      try {
        setTokens((previous) => {
          const next = { ...previous };
          const existingToken = next[tokenId];

          if (existingToken) {
            next[tokenId] = { ...existingToken, refreshingMetadata: true };
          }

          return next;
        });

        const response = await refresh({ variables: { tokenId } });

        if (response.refreshToken?.__typename === 'RefreshTokenPayload') {
          retryToken(tokenId);
        } else {
          pushErrorToast();
          reportError('GraphQL Error while refreshing nft metadata', {
            tags: { tokenId, typename: response.refreshToken?.__typename },
          });
        }
      } catch (e) {
        reportError('GraphQL Error while refreshing nft metadata', { tags: { tokenId } });
        pushErrorToast();
      } finally {
        setTokens((previous) => {
          const next = { ...previous };
          const existingToken = next[tokenId];

          if (existingToken) {
            next[tokenId] = { ...existingToken, refreshingMetadata: false };
          }

          return next;
        });
      }
    },
    [pushToast, refresh, reportError, retryToken]
  );

  const markTokenAsPolling = useCallback<NftErrorContextType['markTokenAsPolling']>((tokenId) => {
    setTokens((previous) => {
      const next = { ...previous };
      const token = { ...(previous[tokenId] ?? defaultTokenErrorState()) };
      next[tokenId] = { ...token, isPolling: true };
      return next;
    });
  }, []);

  const value = useMemo((): NftErrorContextType => {
    return {
      tokens,

      refreshToken,
      handleNftError,
      markTokenAsLoaded,
      clearTokenFailureState,
      markTokenAsPolling,
    };
  }, [
    clearTokenFailureState,
    handleNftError,
    markTokenAsLoaded,
    markTokenAsPolling,
    refreshToken,
    tokens,
  ]);

  return <NftErrorContext.Provider value={value}>{children}</NftErrorContext.Provider>;
}

export function useNftErrorContext() {
  const value = useContext(NftErrorContext);

  if (!value) {
    throw new Error('Tried to use an NftErrorContext without a Provider');
  }

  return value;
}
