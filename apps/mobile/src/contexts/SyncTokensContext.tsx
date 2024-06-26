import { createContext, memo, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { graphql } from 'react-relay';

import { SyncTokensContextForCreatedTokensMutation } from '~/generated/SyncTokensContextForCreatedTokensMutation.graphql';
import { SyncTokensContextForExistingContractMutation } from '~/generated/SyncTokensContextForExistingContractMutation.graphql';
import { Chain, SyncTokensContextMutation } from '~/generated/SyncTokensContextMutation.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

import { useToastActions } from './ToastContext';
import { useTokenStateManagerContext } from './TokenStateManagerContext';

type SyncTokensActions = {
  isSyncing: boolean;
  syncTokens: (chain: Chain | Chain[]) => void;
  isSyncingCreatedTokens: boolean;
  syncCreatedTokens: (chain: Chain) => void;
  isSyncingCreatedTokensForContract: boolean;
  syncCreatedTokensForExistingContract: (contractId: string) => void;
};

const SyncTokensActionsContext = createContext<SyncTokensActions | undefined>(undefined);

export const useSyncTokensActions = (): SyncTokensActions => {
  const context = useContext(SyncTokensActionsContext);
  if (!context) {
    throw new Error('Attempted to use SyncTokensActionsContext without a provider!');
  }

  return context;
};

type Props = { children: ReactNode };

const SyncTokensProvider = memo(({ children }: Props) => {
  const { clearTokenFailureState } = useTokenStateManagerContext();
  const { pushToast } = useToastActions();
  const showFailure = useCallback(() => {
    pushToast({
      autoClose: true,
      message:
        "Something went wrong while syncing your tokens. We're looking into it. Please try again in a few minutes.",
    });
  }, [pushToast]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [isSyncingCreatedTokens, setIsSyncingCreatedTokens] = useState(false);
  const [isSyncingCreatedTokensForContract, setIsSyncingCreatedTokensForContract] = useState(false);

  const [syncTokens] = usePromisifiedMutation<SyncTokensContextMutation>(
    graphql`
      mutation SyncTokensContextMutation($chains: [Chain!]) {
        syncTokens(chains: $chains) {
          __typename
          ... on SyncTokensPayload {
            viewer {
              ... on Viewer {
                user {
                  tokens {
                    id
                    dbid
                    definition {
                      chain
                      contract {
                        isSpam
                        contractAddress {
                          address
                        }
                      }
                      community {
                        # Keeping name in the cache so the contract picker screen
                        # already has the name in the cache
                        # eslint-disable-next-line relay/unused-fields
                        name
                      }
                    }
                    creationTime
                    isSpamByUser
                    ownerIsHolder
                    ownerIsCreator

                    # Refresh tokens for post composer
                    ...NftSelectorPickerGridTokenGridFragment
                    ...NftSelectorPickerGridOneOrManyFragment
                  }
                }
              }
            }
          }
          ... on ErrNotAuthorized {
            message
          }
          ... on ErrSyncFailed {
            message
          }
        }
      }
    `
  );

  const sync = useCallback(
    async (chain: Chain | Chain[]) => {
      try {
        if (isSyncing) {
          return;
        }
        setIsSyncing(true);
        const response = await syncTokens({
          variables: {
            chains: Array.isArray(chain) ? chain : [chain],
          },
        });

        if (response.syncTokens?.__typename !== 'SyncTokensPayload') {
          showFailure();
        } else {
          const tokenIds = removeNullValues(
            response.syncTokens?.viewer?.user?.tokens?.map((token) => {
              return token?.dbid;
            })
          );
          clearTokenFailureState(tokenIds);
        }
        setIsSyncing(false);
      } catch (error) {
        showFailure();
        setIsSyncing(false);
      }
    },
    [clearTokenFailureState, isSyncing, showFailure, syncTokens]
  );

  const [syncCreatedTokensMutation] =
    usePromisifiedMutation<SyncTokensContextForCreatedTokensMutation>(
      graphql`
        mutation SyncTokensContextForCreatedTokensMutation($chain: Chain!) {
          syncCreatedTokensForNewContracts(input: { includeChains: [$chain] }) {
            __typename
            ... on SyncCreatedTokensForNewContractsPayload {
              __typename
              viewer {
                ... on Viewer {
                  user {
                    tokens {
                      id
                      dbid
                      creationTime
                      definition {
                        chain
                        contract {
                          isSpam
                          contractAddress {
                            address
                          }
                        }
                        community {
                          # Keeping name in the cache so the contract picker screen
                          # already has the name in the cache
                          # eslint-disable-next-line relay/unused-fields
                          name
                        }
                      }
                      creationTime
                      isSpamByUser
                      ownerIsHolder
                      ownerIsCreator

                      # Refresh tokens for post composer
                      ...NftSelectorPickerGridTokenGridFragment
                      ...NftSelectorPickerGridOneOrManyFragment
                    }
                  }
                }
              }
            }
            ... on ErrNotAuthorized {
              __typename
              message
            }
            ... on ErrSyncFailed {
              __typename
              message
            }
          }
        }
      `
    );

  const syncCreatedTokens = useCallback(
    async (chain: Chain) => {
      try {
        if (isSyncingCreatedTokens) {
          return;
        }
        setIsSyncingCreatedTokens(true);
        const response = await syncCreatedTokensMutation({
          variables: {
            chain,
          },
        });

        if (
          response.syncCreatedTokensForNewContracts?.__typename !==
          'SyncCreatedTokensForNewContractsPayload'
        ) {
          showFailure();
        } else {
          const tokenIds = removeNullValues(
            response.syncCreatedTokensForNewContracts?.viewer?.user?.tokens?.map((token) => {
              return token?.dbid;
            })
          );
          clearTokenFailureState(tokenIds);
        }
        setIsSyncingCreatedTokens(false);
      } catch (error) {
        showFailure();
        setIsSyncingCreatedTokens(false);
      }
    },
    [clearTokenFailureState, isSyncingCreatedTokens, showFailure, syncCreatedTokensMutation]
  );

  const [syncCreatedTokensForExistingContractMutate] =
    usePromisifiedMutation<SyncTokensContextForExistingContractMutation>(graphql`
      mutation SyncTokensContextForExistingContractMutation(
        $input: SyncCreatedTokensForExistingContractInput!
      ) {
        syncCreatedTokensForExistingContract(input: $input) {
          ... on SyncCreatedTokensForExistingContractPayload {
            __typename
            viewer {
              ... on Viewer {
                user {
                  tokens {
                    id
                    dbid
                    creationTime
                    definition {
                      chain
                      contract {
                        isSpam
                        contractAddress {
                          address
                        }
                      }
                      community {
                        # Keeping name in the cache so the contract picker screen
                        # already has the name in the cache
                        # eslint-disable-next-line relay/unused-fields
                        name
                      }
                    }
                    creationTime
                    isSpamByUser
                    ownerIsHolder
                    ownerIsCreator

                    # Refresh tokens for post composer
                    ...NftSelectorPickerGridTokenGridFragment
                    ...NftSelectorPickerGridOneOrManyFragment
                  }
                }
              }
            }
          }
          ... on ErrNotAuthorized {
            __typename
            message
          }
          ... on ErrSyncFailed {
            __typename
            message
          }
        }
      }
    `);

  const syncCreatedTokensForExistingContract = useCallback(
    async (contractId: string) => {
      try {
        if (isSyncingCreatedTokensForContract) {
          return;
        }
        setIsSyncingCreatedTokensForContract(true);
        const response = await syncCreatedTokensForExistingContractMutate({
          variables: { input: { contractId } },
        });

        if (
          response.syncCreatedTokensForExistingContract?.__typename !==
          'SyncCreatedTokensForExistingContractPayload'
        ) {
          showFailure();
        } else {
          const tokenIds = removeNullValues(
            response.syncCreatedTokensForExistingContract.viewer?.user?.tokens?.map((token) => {
              return token?.dbid;
            })
          );

          clearTokenFailureState(tokenIds);
        }
        setIsSyncingCreatedTokensForContract(false);
      } catch (error) {
        showFailure();
        setIsSyncingCreatedTokensForContract(false);
      }
    },

    [
      isSyncingCreatedTokensForContract,
      syncCreatedTokensForExistingContractMutate,
      showFailure,
      clearTokenFailureState,
    ]
  );

  const value = useMemo(() => {
    return {
      isSyncing,
      syncTokens: sync,
      isSyncingCreatedTokens,
      syncCreatedTokens,
      isSyncingCreatedTokensForContract,
      syncCreatedTokensForExistingContract,
    };
  }, [
    isSyncing,
    sync,
    isSyncingCreatedTokens,
    syncCreatedTokens,
    isSyncingCreatedTokensForContract,
    syncCreatedTokensForExistingContract,
  ]);

  return (
    <SyncTokensActionsContext.Provider value={value}>{children}</SyncTokensActionsContext.Provider>
  );
});

SyncTokensProvider.displayName = 'SyncTokensProvider';

export default SyncTokensProvider;
