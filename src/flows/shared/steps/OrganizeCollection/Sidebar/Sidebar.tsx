import { memo, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import { TitleS, TitleXS } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import { FOOTER_HEIGHT } from 'flows/shared/components/WizardFooter/WizardFooter';
import TextButton from 'components/core/Button/TextButton';
import {
  useCollectionEditorActions,
  SidebarNftsState,
} from 'contexts/collectionEditor/CollectionEditorContext';
import { EditModeNft } from '../types';
import { convertObjectToArray } from '../convertObjectToArray';
import SidebarNftIcon from './SidebarNftIcon';
import SearchBar from './SearchBar';
import { useWizardState } from 'contexts/wizard/WizardDataProvider';
import colors from 'components/core/colors';
import { generate12DigitId } from 'utils/collectionLayout';
import { graphql, useFragment } from 'react-relay';
import { SidebarFragment$key } from '__generated__/SidebarFragment.graphql';
import arrayToObjectKeyedById from 'utils/arrayToObjectKeyedById';

type Props = {
  sidebarNfts: SidebarNftsState;
  nftsRef: SidebarFragment$key;
};

function Sidebar({ nftsRef, sidebarNfts }: Props) {
  const nfts = useFragment(
    graphql`
      fragment SidebarFragment on Nft @relay(plural: true) {
        dbid
        ...SidebarNftIconFragment
        ...SearchBarFragment
      }
    `,
    nftsRef
  );

  const { setNftsIsSelected, stageNfts, unstageAllItems } = useCollectionEditorActions();

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);

  const sidebarNftsAsArray = useMemo(
    () => convertObjectToArray(sidebarNfts).reverse(),
    [sidebarNfts]
  );

  const nftsToDisplayInSidebar = useMemo(() => {
    if (debouncedSearchQuery) {
      const searchResultNfts = [];
      for (const resultId of searchResults) {
        if (sidebarNfts[resultId]) {
          searchResultNfts.push(sidebarNfts[resultId]);
        }
      }

      return searchResultNfts;
    }

    return sidebarNftsAsArray;
  }, [debouncedSearchQuery, searchResults, sidebarNfts, sidebarNftsAsArray]);

  const isAllNftsSelected = useMemo(
    () => !nftsToDisplayInSidebar.some((nft: EditModeNft) => !nft.isSelected),
    [nftsToDisplayInSidebar]
  );

  const handleSelectAllClick = useCallback(() => {
    // Stage all nfts that are !isSelected
    const nftsToStage = nftsToDisplayInSidebar.filter((nft) => !nft.isSelected);
    if (nftsToStage.length === 0) {
      return;
    }

    stageNfts(nftsToStage);
    setNftsIsSelected(
      nftsToStage.map((nft) => nft.id),
      true
    );
  }, [nftsToDisplayInSidebar, stageNfts, setNftsIsSelected]);

  const handleDeselectAllClick = useCallback(() => {
    // deselect all nfts in sidebar
    const nftIdsToUnstage = nftsToDisplayInSidebar.map((nft) => nft.id);
    if (nftIdsToUnstage.length === 0) {
      return;
    }

    setNftsIsSelected(nftIdsToUnstage, false);

    // Unstage all items from the DND
    unstageAllItems();
  }, [nftsToDisplayInSidebar, setNftsIsSelected, unstageAllItems]);

  const handleAddBlankBlockClick = useCallback(() => {
    const id = `blank-${generate12DigitId()}`;
    stageNfts([{ id, whitespace: 'whitespace' }]);
    // auto scroll so that the new block is visible. 100ms timeout to account for async nature of staging nfts
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [stageNfts]);

  const { isRefreshingNfts, handleRefreshNfts } = useWizardState();

  const nftFragmentsKeyedByID = useMemo(() => arrayToObjectKeyedById('dbid', nfts), [nfts]);

  return (
    <StyledSidebar>
      <Header>
        <TitleS>Pieces</TitleS>
        <TextButton
          text={isRefreshingNfts ? 'Refreshing...' : 'Refresh Wallet'}
          onClick={handleRefreshNfts}
          disabled={isRefreshingNfts}
        />
      </Header>
      <Spacer height={16} />
      <SearchBar
        nftsRef={nfts}
        setSearchResults={setSearchResults}
        setDebouncedSearchQuery={setDebouncedSearchQuery}
      />
      <Spacer height={24} />
      <StyledSelectButtonWrapper>
        {isAllNftsSelected ? (
          <TextButton
            text={`Deselect All (${nftsToDisplayInSidebar.length})`}
            onClick={handleDeselectAllClick}
          />
        ) : (
          <TextButton
            text={`Select All (${nftsToDisplayInSidebar.length})`}
            onClick={handleSelectAllClick}
          />
        )}
      </StyledSelectButtonWrapper>
      <Spacer height={8} />
      <Selection>
        <StyledAddBlankBlock onClick={handleAddBlankBlockClick}>
          <StyledAddBlankBlockText>Add Blank Space</StyledAddBlankBlockText>
        </StyledAddBlankBlock>
        {nftsToDisplayInSidebar
          .filter((editModeNft) => Boolean(nftFragmentsKeyedByID[editModeNft.id]))
          .map((editModeNft) => (
            <SidebarNftIcon
              key={editModeNft.id}
              nftRef={nftFragmentsKeyedByID[editModeNft.id]}
              editModeNft={editModeNft}
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
`;

const StyledSelectButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const Selection = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 218px;
  justify-content: space-between;
`;

export default memo(Sidebar);
