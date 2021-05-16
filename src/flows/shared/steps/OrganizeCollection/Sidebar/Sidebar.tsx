import { memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';

import { BodyMedium } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import { FOOTER_HEIGHT } from 'flows/shared/components/WizardFooter/WizardFooter';
import SidebarNftIcon from './SidebarNftIcon';
import TextButton from 'components/core/Button/TextButton';

import { EditModeNft } from 'types/Nft';

import {
  useAllNftsState,
  useCollectionEditorActions,
} from 'contexts/collectionEditor/CollectionEditorContext';

function Sidebar() {
  const allNfts = useAllNftsState();
  const {
    setNftsIsSelected,
    stageNfts,
    unstageNfts,
  } = useCollectionEditorActions();

  const isAllNftsSelected = useMemo(() => {
    return !allNfts.find((nft) => !nft.isSelected);
  }, [allNfts]);

  const handleSelectAllClick = useCallback(() => {
    // Stage all nfts that are !isSelected
    const nftsToStage = allNfts.filter((nft) => !nft.isSelected);
    if (!nftsToStage.length) {
      return;
    }
    stageNfts(nftsToStage);
    setNftsIsSelected(nftsToStage, true);
  }, [allNfts, setNftsIsSelected, stageNfts]);

  const handleDeselectAllClick = useCallback(() => {
    // Unstage all nfts
    const nftIdsToUnstage = allNfts.map((nft) => nft.id);
    if (!nftIdsToUnstage.length) {
      return;
    }
    unstageNfts(nftIdsToUnstage);
    setNftsIsSelected(allNfts, false);
  }, [allNfts, setNftsIsSelected, unstageNfts]);
  return (
    <StyledSidebar>
      <Header>
        <BodyMedium>Your NFTs</BodyMedium>
        {isAllNftsSelected ? (
          <TextButton
            text="Deselect All"
            onClick={handleDeselectAllClick}
          ></TextButton>
        ) : (
          <TextButton
            text="Select All"
            onClick={handleSelectAllClick}
          ></TextButton>
        )}
        {/* <BodyRegular color={colors.gray50}>0xj2T2...a81H</BodyRegular> */}
      </Header>
      <Spacer height={12} />
      <Selection>
        {allNfts.map((editModeNft: EditModeNft, index: number) => (
          <SidebarNftIcon
            key={editModeNft.nft.id}
            editModeNft={editModeNft}
            index={index}
          />
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
`;

const Selection = styled.div`
  display: flex;
  flex-wrap: wrap;
  column-gap: 12px;
  row-gap: 12px;
`;

export default memo(Sidebar);
