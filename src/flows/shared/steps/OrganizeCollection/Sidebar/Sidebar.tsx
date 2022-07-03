import { memo, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import { TitleS, TitleXS } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import { FOOTER_HEIGHT } from 'flows/shared/components/WizardFooter/WizardFooter';
import TextButton from 'components/core/Button/TextButton';
import {
  useCollectionEditorActions,
  SidebarTokensState,
} from 'contexts/collectionEditor/CollectionEditorContext';
import { EditModeToken } from '../types';
import { convertObjectToArray } from '../convertObjectToArray';
import SidebarNftIcon from './SidebarNftIcon';
import SearchBar from './SearchBar';
import { useWizardState } from 'contexts/wizard/WizardDataProvider';
import colors from 'components/core/colors';
import { generate12DigitId } from 'utils/collectionLayout';
import { graphql, useFragment } from 'react-relay';
import { SidebarFragment$key } from '__generated__/SidebarFragment.graphql';
import arrayToObjectKeyedById from 'utils/arrayToObjectKeyedById';
import { removeNullValues } from 'utils/removeNullValues';

type Props = {
  sidebarTokens: SidebarTokensState;
  tokensRef: SidebarFragment$key;
};

function Sidebar({ tokensRef, sidebarTokens }: Props) {
  const allTokens = useFragment(
    graphql`
      fragment SidebarFragment on Token @relay(plural: true) {
        dbid
        ...SidebarNftIconFragment
        ...SearchBarFragment
      }
    `,
    tokensRef
  );

  const tokens = removeNullValues(allTokens);

  const { setTokensIsSelected, stageTokens, unstageAllItems } = useCollectionEditorActions();

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);

  const sidebarTokensAsArray = useMemo(() => convertObjectToArray(sidebarTokens), [sidebarTokens]);

  const tokensToDisplayInSidebar = useMemo(() => {
    if (debouncedSearchQuery) {
      const searchResultNfts = [];
      for (const resultId of searchResults) {
        if (sidebarTokens[resultId]) {
          searchResultNfts.push(sidebarTokens[resultId]);
        }
      }

      return searchResultNfts;
    }

    return sidebarTokensAsArray;
  }, [debouncedSearchQuery, searchResults, sidebarTokens, sidebarTokensAsArray]);

  const isAllNftsSelected = useMemo(
    () => !tokensToDisplayInSidebar.some((token: EditModeToken) => !token.isSelected),
    [tokensToDisplayInSidebar]
  );

  const handleSelectAllClick = useCallback(() => {
    // Stage all tokens that are !isSelected
    const tokensToStage = tokensToDisplayInSidebar.filter((token) => !token.isSelected);
    if (tokensToStage.length === 0) {
      return;
    }

    stageTokens(tokensToStage);
    setTokensIsSelected(
      tokensToStage.map((token) => token.id),
      true
    );
  }, [tokensToDisplayInSidebar, stageTokens, setTokensIsSelected]);

  const handleDeselectAllClick = useCallback(() => {
    // deselect all tokens in sidebar
    const tokenIdsToUnstage = tokensToDisplayInSidebar.map((token) => token.id);
    if (tokenIdsToUnstage.length === 0) {
      return;
    }

    setTokensIsSelected(tokenIdsToUnstage, false);

    // Unstage all items from the DND
    unstageAllItems();
  }, [tokensToDisplayInSidebar, setTokensIsSelected, unstageAllItems]);

  const handleAddBlankBlockClick = useCallback(() => {
    const id = `blank-${generate12DigitId()}`;
    stageTokens([{ id, whitespace: 'whitespace' }]);
    // auto scroll so that the new block is visible. 100ms timeout to account for async nature of staging tokens
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [stageTokens]);

  const { isRefreshingNfts, handleRefreshNfts } = useWizardState();

  const nftFragmentsKeyedByID = useMemo(() => arrayToObjectKeyedById('dbid', tokens), [tokens]);

  return (
    <StyledSidebar>
      <Header>
        <TitleS>All pieces</TitleS>
        <StyledRefreshButton
          text={isRefreshingNfts ? 'Refreshing...' : 'Refresh wallet'}
          onClick={handleRefreshNfts}
          disabled={isRefreshingNfts}
        />
      </Header>
      <Spacer height={16} />
      <SearchBar
        tokensRef={tokens}
        setSearchResults={setSearchResults}
        setDebouncedSearchQuery={setDebouncedSearchQuery}
      />
      <Spacer height={24} />
      <StyledSelectButtonWrapper>
        {isAllNftsSelected ? (
          <TextButton
            text={`Deselect All (${tokensToDisplayInSidebar.length})`}
            onClick={handleDeselectAllClick}
          />
        ) : (
          <TextButton
            text={`Select All (${tokensToDisplayInSidebar.length})`}
            onClick={handleSelectAllClick}
          />
        )}
      </StyledSelectButtonWrapper>
      <Spacer height={16} />
      <Selection>
        <StyledAddBlankBlock onClick={handleAddBlankBlockClick}>
          <StyledAddBlankBlockText>Add Blank Space</StyledAddBlankBlockText>
        </StyledAddBlankBlock>
        {tokensToDisplayInSidebar
          .filter((EditModeToken) => Boolean(nftFragmentsKeyedByID[EditModeToken.id]))
          .map((EditModeToken) => (
            <SidebarNftIcon
              key={EditModeToken.id}
              tokenRef={nftFragmentsKeyedByID[EditModeToken.id]}
              EditModeToken={EditModeToken}
            />
          ))}
      </Selection>
      <Spacer height={12} />
    </StyledSidebar>
  );
}

const StyledAddBlankBlock = styled.div`
  height: 60px;
  width: 60px;
  background-color: ${colors.offWhite};
  border: 1px solid ${colors.metal};
  text-transform: uppercase;
  display: flex;
  align-items: center;
  user-select: none;

  &:hover {
    cursor: pointer;
  }

  &:active {
    background-color: ${colors.metal};
  }
`;

const StyledAddBlankBlockText = styled(TitleXS)`
  color: ${colors.shadow};
  text-align: center;
`;

const StyledSidebar = styled.div`
  height: calc(100vh - ${FOOTER_HEIGHT}px);
  border-right: 1px solid ${colors.porcelain};

  padding: 16px;

  overflow: auto;
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
`;

const StyledSelectButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const Selection = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 218px;
  grid-gap: 19px;
`;

// This has the styling from InteractiveLink but we cannot use InteractiveLink because it is a TextButton
const StyledRefreshButton = styled(TextButton)`
  & p {
    font-size: 14px;
    line-height: 18px;
    text-transform: none;
    text-decoration: underline;
  }
`;

export default memo(Sidebar);
