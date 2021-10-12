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
import { useRefreshUnassignedNfts } from 'hooks/api/nfts/useUnassignedNfts';
import { useRefreshOpenseaSync } from 'hooks/api/nfts/useOpenseaSync';
import { EditModeNft } from '../types';
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

  // search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<EditModeNft[]>([]);

  const isAllNftsSelected = useMemo(() => !sidebarNfts.some((nft: EditModeNft) => !nft.isSelected), [sidebarNfts]);

  const handleSelectAllClick = useCallback(() => {
    // Stage all nfts that are !isSelected
    const nftsToStage = sidebarNfts.filter(nft => !nft.isSelected);
    if (nftsToStage.length === 0) {
      return;
    }

    stageNfts(nftsToStage);
    setNftsIsSelected(nftsToStage, true);
  }, [sidebarNfts, setNftsIsSelected, stageNfts]);

  const handleDeselectAllClick = useCallback(() => {
    // Unstage all nfts
    const nftIdsToUnstage = sidebarNfts.map(nft => nft.id);
    if (nftIdsToUnstage.length === 0) {
      return;
    }

    unstageNfts(nftIdsToUnstage);
    setNftsIsSelected(sidebarNfts, false);
  }, [sidebarNfts, setNftsIsSelected, unstageNfts]);

  const handleRefreshWalletClick = useCallback(async () => {
    await refreshOpenseaSync({ skipCache: true });
    void refreshUnassignedNfts({ skipCache: true });
  }, [refreshOpenseaSync, refreshUnassignedNfts]);

  const nftsToDisplayInSidebar = useMemo(() => searchQuery ? searchResults : sidebarNfts, [searchQuery, searchResults, sidebarNfts]);

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
        setSearchQuery={setSearchQuery}
        sidebarNfts={sidebarNfts}
      />
      <Spacer height={24} />
      <StyledSelectButtonWrapper>
        {isAllNftsSelected ? (
          <TextButton
            text={`Deselect All (${sidebarNfts.length})`}
            onClick={handleDeselectAllClick}
          />
        ) : (
          <TextButton
            text={`Select All (${sidebarNfts.length})`}
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
