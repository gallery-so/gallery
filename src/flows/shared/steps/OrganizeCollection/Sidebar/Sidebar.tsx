import { memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';

import { BodyMedium } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import { FOOTER_HEIGHT } from 'flows/shared/components/WizardFooter/WizardFooter';
import SidebarNftIcon from './SidebarNftIcon';
import TextButton from 'components/core/Button/TextButton';

import { EditModeNft } from 'types/Nft';

import {
  useSidebarNftsState,
  useCollectionEditorActions,
} from 'contexts/collectionEditor/CollectionEditorContext';

function Sidebar() {
  const sidebarNfts = useSidebarNftsState();
  const {
    setNftsIsSelected,
    stageNfts,
    unstageNfts,
  } = useCollectionEditorActions();

  const isAllNftsSelected = useMemo(() => {
    return !sidebarNfts.find((nft) => !nft.isSelected);
  }, [sidebarNfts]);

  const handleSelectAllClick = useCallback(() => {
    // Stage all nfts that are !isSelected
    const nftsToStage = sidebarNfts.filter((nft) => !nft.isSelected);
    if (!nftsToStage.length) {
      return;
    }
    stageNfts(nftsToStage);
    setNftsIsSelected(nftsToStage, true);
  }, [sidebarNfts, setNftsIsSelected, stageNfts]);

  const handleDeselectAllClick = useCallback(() => {
    // Unstage all nfts
    const nftIdsToUnstage = sidebarNfts.map((nft) => nft.id);
    if (!nftIdsToUnstage.length) {
      return;
    }
    unstageNfts(nftIdsToUnstage);
    setNftsIsSelected(sidebarNfts, false);
  }, [sidebarNfts, setNftsIsSelected, unstageNfts]);
  return (
    <StyledSidebar>
      <Header>
        <BodyMedium>Your NFTs</BodyMedium>
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
      </Header>
      <Spacer height={12} />
      <Selection>
        {sidebarNfts.map((editModeNft: EditModeNft, index: number) => (
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
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Selection = styled.div`
  display: flex;
  flex-wrap: wrap;
  column-gap: 12px;
  row-gap: 12px;
`;

export default memo(Sidebar);
