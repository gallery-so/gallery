import { memo, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import { TitleS } from 'components/core/Text/Text';
import {
  SidebarTokensState,
  useCollectionEditorActions,
} from 'contexts/collectionEditor/CollectionEditorContext';
import { convertObjectToArray } from '../convertObjectToArray';
import SearchBar from './SearchBar';
import colors from 'components/core/colors';
import { graphql, useFragment } from 'react-relay';
import { SidebarFragment$key } from '__generated__/SidebarFragment.graphql';
import { removeNullValues } from 'utils/removeNullValues';
import { SidebarViewerFragment$key } from '__generated__/SidebarViewerFragment.graphql';
import keyBy from 'lodash.keyby';
import { SidebarChainSelector } from 'components/ManageGallery/OrganizeCollection/Sidebar/SidebarChainSelector';
import { Button } from 'components/core/Button/Button';
import { generate12DigitId } from 'utils/collectionLayout';
import { SidebarTokens } from 'components/ManageGallery/OrganizeCollection/Sidebar/SidebarTokens';
import { Chain } from 'components/ManageGallery/OrganizeCollection/Sidebar/chains';
import { VStack } from 'components/core/Spacer/Stack';
import { AddWalletSidebar } from './AddWalletSidebar';
import { useToastActions } from 'contexts/toast/ToastContext';
import { usePromisifiedMutation } from 'hooks/usePromisifiedMutation';
import { useReportError } from 'contexts/errorReporting/ErrorReportingContext';
import { Severity } from '@sentry/nextjs';
import { SidebarMutation } from '__generated__/SidebarMutation.graphql';
import { FOOTER_HEIGHT } from 'components/Onboarding/constants';

type Props = {
  sidebarTokens: SidebarTokensState;
  tokensRef: SidebarFragment$key;
  queryRef: SidebarViewerFragment$key;
};

function Sidebar({ tokensRef, sidebarTokens, queryRef }: Props) {
  const allTokens = useFragment(
    graphql`
      fragment SidebarFragment on Token @relay(plural: true) {
        dbid
        chain

        ...SearchBarFragment
        ...SidebarTokensFragment
        ...getVideoOrImageUrlForNftPreviewFragment
      }
    `,
    tokensRef
  );

  const query = useFragment(
    graphql`
      fragment SidebarViewerFragment on Query {
        viewer {
          ... on Viewer {
            user {
              wallets {
                chainAddress {
                  address
                  chain
                }
              }
            }
          }
        }

        ...SidebarChainSelectorFragment
        ...isFeatureEnabledFragment
        ...AddWalletSidebarQueryFragment
      }
    `,
    queryRef
  );

  const { stageTokens } = useCollectionEditorActions();
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [selectedChain, setSelectedChain] = useState<Chain>('Ethereum');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // TODO(Terence): Figure out where to store this state;
  const isRefreshingNfts = false;
  const setIsRefreshingNfts = useCallback(() => {}, []);
  // const { isRefreshingNfts, setIsRefreshingNfts } = useWizardState();

  const { pushToast } = useToastActions();
  const reportError = useReportError();

  const isSearching = debouncedSearchQuery.length > 0;

  const nonNullTokens = removeNullValues(allTokens);
  const sidebarTokensAsArray = useMemo(() => convertObjectToArray(sidebarTokens), [sidebarTokens]);

  // Only show blank space + add account button
  // 1. if the user don't have selected account
  // 2. the selected chain is selected account
  const ownsWalletFromSelectedChain = useMemo(() => {
    let chain = selectedChain;
    if (selectedChain === 'POAP') {
      chain = 'Ethereum';
    }

    const ownsWalletFromChain = query.viewer?.user?.wallets?.some(
      (wallet) => wallet?.chainAddress?.chain === chain
    );

    return ownsWalletFromChain ?? false;
  }, [query, selectedChain]);

  const editModeTokensSearchResults = useMemo(() => {
    if (!debouncedSearchQuery) {
      return sidebarTokensAsArray;
    }

    const searchResultNfts = [];
    for (const resultId of searchResults) {
      if (sidebarTokens[resultId]) {
        searchResultNfts.push(sidebarTokens[resultId]);
      }
    }

    return searchResultNfts;
  }, [debouncedSearchQuery, searchResults, sidebarTokens, sidebarTokensAsArray]);

  const nftFragmentsKeyedByID = useMemo(
    () => keyBy(nonNullTokens, (token) => token.dbid),
    [nonNullTokens]
  );

  const handleAddBlankBlockClick = useCallback(() => {
    const id = `blank-${generate12DigitId()}`;
    stageTokens([{ id, whitespace: 'whitespace' }]);
    // auto scroll so that the new block is visible. 100ms timeout to account for async nature of staging tokens
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [stageTokens]);

  const tokensToDisplay = useMemo(() => {
    return editModeTokensSearchResults.filter((editModeToken) => {
      const token = nftFragmentsKeyedByID[editModeToken.id];

      // Ensure we have a 1-1 match.
      // Every EditModeToken should have a Token from Relay
      if (!token) {
        return false;
      }

      // If we're searching, we want to search across all chains
      if (isSearching) {
        return true;
      }

      return token.chain === selectedChain;
    });
  }, [editModeTokensSearchResults, isSearching, nftFragmentsKeyedByID, selectedChain]);

  /**
   * We're explicitly avoiding using the `isMutating` flag from the hook itself
   * since that state is meant to be managed in the WizardState.
   *
   * This is because this refresh can happen in multiple places and we want
   * to lock this refresh no matter where it originated from
   */
  const [refresh] = usePromisifiedMutation<SidebarMutation>(graphql`
    mutation SidebarMutation($chain: Chain!) {
      syncTokens(chains: [$chain]) {
        __typename
        ... on SyncTokensPayload {
          viewer {
            ...CollectionEditorViewerFragment
          }
        }
      }
    }
  `);

  const handleRefresh = useCallback(async () => {
    if (!selectedChain) {
      return;
    }

    setIsRefreshingNfts(true);

    pushToast({
      message: 'We’re retrieving your new pieces. This may take up to a few minutes.',
      autoClose: true,
    });

    try {
      const response = await refresh({
        variables: {
          chain: selectedChain,
        },
      });

      if (response.syncTokens?.__typename !== 'SyncTokensPayload') {
        pushToast({
          autoClose: false,
          message:
            'There was an error while trying to sync your tokens. We have been notified and are looking into it.',
        });

        reportError('Error while syncing tokens for chain. Typename was not `SyncTokensPayload`', {
          level: Severity.Error,
          tags: {
            chain: selectedChain,
            responseTypename: response.syncTokens?.__typename,
          },
        });
      }
    } catch (e) {
      if (e instanceof Error) {
        reportError(e);
      } else {
        reportError('Could not run SidebarChainSelectorMutation for an unknown reason');
      }
    } finally {
      setIsRefreshingNfts(false);
    }
  }, [pushToast, refresh, reportError, selectedChain, setIsRefreshingNfts]);

  return (
    <StyledSidebar>
      <StyledSidebarContainer gap={8}>
        <Header>
          <TitleS>All pieces</TitleS>
        </Header>
        <SearchBar
          tokensRef={nonNullTokens}
          setSearchResults={setSearchResults}
          setDebouncedSearchQuery={setDebouncedSearchQuery}
        />
        {!isSearching && (
          <>
            <SidebarChainSelector
              ownsWalletFromSelectedChain={ownsWalletFromSelectedChain}
              queryRef={query}
              selected={selectedChain}
              onChange={setSelectedChain}
              handleRefresh={handleRefresh}
              isRefreshingNfts={isRefreshingNfts}
            />
            {ownsWalletFromSelectedChain && (
              <AddBlankSpaceButton onClick={handleAddBlankBlockClick} variant="secondary">
                ADD BLANK SPACE
              </AddBlankSpaceButton>
            )}
          </>
        )}
      </StyledSidebarContainer>

      {ownsWalletFromSelectedChain ? (
        <SidebarTokens
          isSearching={isSearching}
          tokenRefs={nonNullTokens}
          selectedChain={selectedChain}
          editModeTokens={tokensToDisplay}
        />
      ) : (
        <AddWalletSidebar
          selectedChain={selectedChain}
          queryRef={query}
          handleRefresh={handleRefresh}
        />
      )}
    </StyledSidebar>
  );
}

const StyledSidebarContainer = styled(VStack)`
  padding: 0 16px;
`;

const AddBlankSpaceButton = styled(Button)`
  margin: 4px 0;
`;

const StyledSidebar = styled.div`
  display: flex;
  flex-direction: column;

  padding: 16px 0;

  height: calc(100vh - ${FOOTER_HEIGHT}px);
  border-right: 1px solid ${colors.porcelain};
  user-select: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  min-height: 52px;
  padding-bottom: 16px;
`;

export default memo(Sidebar);
