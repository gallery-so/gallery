import colors from 'components/core/colors';
import transitions from 'components/core/transitions';
import { useCollectionEditorActions } from 'contexts/collectionEditor/CollectionEditorContext';
import { memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { EditModeNft } from '../types';

type SidebarNftIconProps = {
  editModeNft: EditModeNft;
};

function SidebarNftIcon({ editModeNft }: SidebarNftIconProps) {
  const isSelected = useMemo(() => Boolean(editModeNft.isSelected), [
    editModeNft.isSelected,
  ]);

  const {
    setNftsIsSelected,
    stageNfts,
    unstageNfts,
  } = useCollectionEditorActions();

  const handleClick = useCallback(() => {
    setNftsIsSelected([editModeNft], !isSelected);
    isSelected ? unstageNfts([editModeNft.id]) : stageNfts([editModeNft]);
  }, [editModeNft, isSelected, setNftsIsSelected, stageNfts, unstageNfts]);

  return (
    <StyledSidebarNftIcon>
      <StyledImage
        isSelected={isSelected}
        src={editModeNft.nft.image_thumbnail_url}
        alt="nft"
      />
      <StyledOutline onClick={handleClick} isSelected={isSelected} />
    </StyledSidebarNftIcon>
  );
}

export const StyledSidebarNftIcon = styled.div`
  position: relative;
  width: 64px;
  height: 64px;
  overflow: hidden;
`;

type SelectedProps = {
  isSelected: boolean;
};

const StyledOutline = styled.div<SelectedProps>`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;

  border: ${({ isSelected }) => (isSelected ? 1 : 0)}px solid ${colors.green};
`;

const StyledImage = styled.img<SelectedProps>`
  width: 100%;

  transition: opacity ${transitions.cubic};

  opacity: ${({ isSelected }) => (isSelected ? 0.5 : 1)};
`;

export default memo(SidebarNftIcon);
