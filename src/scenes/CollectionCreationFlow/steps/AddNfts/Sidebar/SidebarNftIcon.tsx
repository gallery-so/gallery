import colors from 'components/core/colors';
import { useCollectionEditorActions } from 'contexts/collectionEditor/CollectionEditorContext';
import useEffectAfterMount from 'hooks/useEffectAfterMount';
import { memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { EditModeNft } from 'types/Nft';

type SidebarNftIconProps = {
  editModeNft: EditModeNft;
  index: number;
};

function SidebarNftIcon({ editModeNft, index }: SidebarNftIconProps) {
  const isSelected = useMemo(() => !!editModeNft.isSelected, [
    editModeNft.isSelected,
  ]);
  const {
    setNftIsSelected,
    stageNft,
    unstageNft,
  } = useCollectionEditorActions();

  const handleClick = useCallback(() => {
    setNftIsSelected(index, !isSelected);
  }, [index, isSelected, setNftIsSelected]);

  const handleUpdate = useCallback(() => {
    isSelected ? stageNft(editModeNft) : unstageNft(editModeNft.nft.id);
  }, [editModeNft, isSelected, stageNft, unstageNft]);

  useEffectAfterMount(handleUpdate);

  return (
    <StyledSidebarNftIcon>
      <StyledImage
        isSelected={isSelected}
        src={editModeNft.nft.image_url}
        alt="nft"
      />
      <StyledOutline onClick={handleClick} isSelected={isSelected} />
    </StyledSidebarNftIcon>
  );
}

const StyledSidebarNftIcon = styled.div`
  position: relative;
  width: 64px;
  height: 64px;
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

  outline: ${({ isSelected }) => (isSelected ? 1 : 0)}px solid ${colors.green};
`;

const StyledImage = styled.img<SelectedProps>`
  width: 100%;
  height: 100%;

  transition: opacity 0.2s;

  opacity: ${({ isSelected }) => (isSelected ? 0.5 : 1)};
`;

export default memo(SidebarNftIcon);
