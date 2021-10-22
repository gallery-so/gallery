import { memo, useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';

import { BodyMedium } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import { FOOTER_HEIGHT } from 'flows/shared/components/WizardFooter/WizardFooter';
import TextButton from 'components/core/Button/TextButton';
import {
  useSidebarNftsState,
  useCollectionEditorActions,
} from 'contexts/collectionEditor/CollectionEditorContext';
import { useMutateUnassignedNftsCache, useRefreshUnassignedNfts } from 'hooks/api/nfts/useUnassignedNfts';
import { useRefreshOpenseaSync } from 'hooks/api/nfts/useOpenseaSync';
import { EditModeNft } from '../types';
import { convertObjectToArray } from '../convertObjectToArray';
import SidebarNftIcon from './SidebarNftIcon';
import SearchBar from './SearchBar';

function Sidebar() {
  const sidebarNfts = useSidebarNftsState();
  const {
    setNftsIsSelected,
    stageNfts,
    unstageNfts,
  } = useCollectionEditorActions();
  const refreshOpenseaSync = useRefreshOpenseaSync();
  const refreshUnassignedNfts = useRefreshUnassignedNfts();
  const mutateUnassignedNftsCache = useMutateUnassignedNftsCache();

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);

  const sidebarNftsAsArray = useMemo(() => convertObjectToArray(sidebarNfts), [sidebarNfts]);

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

  const isAllNftsSelected = useMemo(() => !nftsToDisplayInSidebar.some((nft: EditModeNft) => !nft.isSelected), [nftsToDisplayInSidebar]);

  const handleSelectAllClick = useCallback(() => {
    // Stage all nfts that are !isSelected
    const nftsToStage = nftsToDisplayInSidebar.filter(nft => !nft.isSelected);
    if (nftsToStage.length === 0) {
      return;
    }

    stageNfts(nftsToStage);
    setNftsIsSelected(nftsToStage, true);
  }, [nftsToDisplayInSidebar, stageNfts, setNftsIsSelected]);

  const handleDeselectAllClick = useCallback(() => {
    // Unstage all nfts
    const nftIdsToUnstage = nftsToDisplayInSidebar.map(nft => nft.id);
    if (nftIdsToUnstage.length === 0) {
      return;
    }

    unstageNfts(nftIdsToUnstage);
    setNftsIsSelected(nftsToDisplayInSidebar, false);
  }, [nftsToDisplayInSidebar, setNftsIsSelected, unstageNfts]);

  const handleRefreshWalletClick = useCallback(async () => {
    await refreshOpenseaSync();
    await refreshUnassignedNfts();
    void mutateUnassignedNftsCache();
  }, [mutateUnassignedNftsCache, refreshOpenseaSync, refreshUnassignedNfts]);

  return (
    <StyledSidebar>
      <Header>
        <BodyMedium>Your NFTs</BodyMedium>
        <TextButton
          text="Refresh Wallet"
          onClick={handleRefreshWalletClick}
        />
      </Header>
      <Spacer height={16} />
      <SearchBar
        setSearchResults={setSearchResults}
        setDebouncedSearchQuery={setDebouncedSearchQuery}
        sidebarNfts={sidebarNftsAsArray}
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
        {nftsToDisplayInSidebar.map((editModeNft: EditModeNft) => (
          <SidebarNftIcon key={editModeNft.nft.id} editModeNft={editModeNft} />
        ))}
      </Selection>
      <Spacer height={12} />
    </StyledSidebar>
  );
}

const StyledSidebar = styled.div`
  width: 100%;
  height: calc(100vh - ${FOOTER_HEIGHT}px);

  background: #f7f7f7;

  padding: 50px 32px;

  overflow: scroll;

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

  // Safari doesn't support this yet
  // column-gap: 12px;
  // row-gap: 12px;

  // Temporary solution until Safari support
  width: calc(100% + 12px);
  margin-left: -6px;
`;

export default memo(Sidebar);
