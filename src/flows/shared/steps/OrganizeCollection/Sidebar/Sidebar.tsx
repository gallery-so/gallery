import { memo, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import { TitleS } from 'components/core/Text/Text';
import { FOOTER_HEIGHT } from 'flows/shared/components/WizardFooter/WizardFooter';
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
import { SidebarChainSelector } from 'flows/shared/steps/OrganizeCollection/Sidebar/SidebarChainSelector';
import { Button } from 'components/core/Button/Button';
import { generate12DigitId } from 'utils/collectionLayout';
import { SidebarTokens } from 'flows/shared/steps/OrganizeCollection/Sidebar/SidebarTokens';
import { Chain } from 'flows/shared/steps/OrganizeCollection/Sidebar/chains';
import { VStack } from 'components/core/Spacer/Stack';
import { AddWalletSidebar } from './AddWalletSidebar';

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

  const nftFragmentsKeyedByID = useMemo(() => keyBy(nonNullTokens, (token) => token.dbid), [
    nonNullTokens,
  ]);

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
              isTezosAccountConnected={ownsWalletFromSelectedChain}
              queryRef={query}
              selected={selectedChain}
              onChange={setSelectedChain}
            />
            {ownsWalletFromSelectedChain && (
              <AddBlankSpaceButton onClick={handleAddBlankBlockClick} variant="secondary">
                ADD BLANK SPACE
              </AddBlankSpaceButton>
            )}
          </>
        )}
      </StyledSidebarContainer>
      <AddWalletSidebar selectedChain={selectedChain} queryRef={query} />

      {ownsWalletFromSelectedChain ? (
        <SidebarTokens
          isSearching={isSearching}
          tokenRefs={nonNullTokens}
          selectedChain={selectedChain}
          editModeTokens={tokensToDisplay}
        />
      ) : (
        <AddWalletSidebar selectedChain={selectedChain} queryRef={query} />
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
